using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.Entities;
using ERP.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace ERP.Services.Lookup
{
    public class AddressService : IAddressService
    {
        private readonly AppDbContext _dbContext;
        private readonly IDistributedCache _cache;
        private readonly Microsoft.Extensions.Caching.Memory.IMemoryCache _memoryCache;
        private readonly HttpClient _httpClient;
        private readonly ILogger<AddressService> _logger;

        private const string PROVINCES_CACHE_KEY = "address_provinces";
        private const string DISTRICTS_CACHE_KEY_PREFIX = "address_districts_";
        private const string WARDS_CACHE_KEY_PREFIX = "address_wards_";
        
        private const string MERGED_PROVINCES_CACHE_KEY = "address_merged_provinces";
        private const string MERGED_DISTRICTS_CACHE_KEY_PREFIX = "address_merged_districts_";
        private const string MERGED_WARDS_CACHE_KEY_PREFIX = "address_merged_wards_";

        private const string EXTERNAL_API_URL = "https://provinces.open-api.vn/api/v1/?depth=3";
        private const string EXTERNAL_API_V2_URL = "https://provinces.open-api.vn/api/v2/p/";
        private const string EXTERNAL_API_V2_DETAIL = "https://provinces.open-api.vn/api/v2/p/";
        
        private static readonly TimeSpan CacheDuration = TimeSpan.FromDays(7);

        public AddressService(
            AppDbContext dbContext,
            IDistributedCache cache,
            Microsoft.Extensions.Caching.Memory.IMemoryCache memoryCache,
            HttpClient httpClient,
            ILogger<AddressService> logger)
        {
            _dbContext = dbContext;
            _cache = cache;
            _memoryCache = memoryCache;
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<IEnumerable<GeographicalLookupDto>> GetProvincesAsync()
        {
            return await GetGeographicalDataAsync(
                PROVINCES_CACHE_KEY,
                () => _dbContext.Provinces.AsNoTracking().Select(p => new GeographicalLookupDto { Code = p.code, Name = p.name }).OrderBy(p => p.Name).ToListAsync()
            );
        }

        public async Task<IEnumerable<GeographicalLookupDto>> GetDistrictsAsync(string provinceCode)
        {
            return await GetGeographicalDataAsync(
                $"{DISTRICTS_CACHE_KEY_PREFIX}{provinceCode}",
                () => _dbContext.Districts.AsNoTracking().Where(d => d.province_code == provinceCode).Select(d => new GeographicalLookupDto { Code = d.code, Name = d.name, ParentCode = d.province_code }).OrderBy(d => d.Name).ToListAsync()
            );
        }

        public async Task<IEnumerable<GeographicalLookupDto>> GetWardsAsync(string districtCode)
        {
            return await GetGeographicalDataAsync(
                $"{WARDS_CACHE_KEY_PREFIX}{districtCode}",
                () => _dbContext.Wards.AsNoTracking().Where(w => w.district_code == districtCode).Select(w => new GeographicalLookupDto { Code = w.code, Name = w.name, ParentCode = w.district_code }).OrderBy(w => w.Name).ToListAsync()
            );
        }

        // NEW: Merged Address Methods (API v2)
        public async Task<IEnumerable<GeographicalLookupDto>> GetMergedProvincesAsync()
        {
            return await GetGeographicalDataAsync(
                MERGED_PROVINCES_CACHE_KEY,
                () => _dbContext.MergedProvinces.AsNoTracking().Select(p => new GeographicalLookupDto { Code = p.code, Name = p.name }).OrderBy(p => p.Name).ToListAsync()
            );
        }

        public async Task<IEnumerable<GeographicalLookupDto>> GetMergedWardsAsync(string provinceCode)
        {
            return await GetGeographicalDataAsync(
                $"{MERGED_WARDS_CACHE_KEY_PREFIX}{provinceCode}",
                () => _dbContext.MergedWards.AsNoTracking().Where(w => w.province_code == provinceCode).Select(w => new GeographicalLookupDto { Code = w.code, Name = w.name, ParentCode = w.province_code }).OrderBy(w => w.Name).ToListAsync()
            );
        }

        private async Task<IEnumerable<GeographicalLookupDto>> GetGeographicalDataAsync(string cacheKey, Func<Task<List<GeographicalLookupDto>>> dbFetch)
        {
            if (_memoryCache.TryGetValue<IEnumerable<GeographicalLookupDto>>(cacheKey, out var memoryData))
                return memoryData!;

            try
            {
                var cachedData = await _cache.GetStringAsync(cacheKey);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    var redisData = JsonSerializer.Deserialize<IEnumerable<GeographicalLookupDto>>(cachedData)!;
                    _memoryCache.Set(cacheKey, redisData, new MemoryCacheEntryOptions { AbsoluteExpirationRelativeToNow = CacheDuration });
                    return redisData;
                }
            }
            catch (Exception ex) { _logger.LogWarning(ex, "Redis cache error for {Key}", cacheKey); }

            var data = await dbFetch();

            if (data != null && data.Any())
            {
                _memoryCache.Set(cacheKey, data, new MemoryCacheEntryOptions { AbsoluteExpirationRelativeToNow = CacheDuration });
                try
                {
                    await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(data), new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = CacheDuration });
                }
                catch (Exception ex) { _logger.LogWarning(ex, "Failed to write {Key} to Redis", cacheKey); }
            }

            return data ?? new List<GeographicalLookupDto>();
        }

        public async Task SyncMergedAddressDataAsync()
        {
            try
            {
                _logger.LogInformation("Starting Merged Address Data Sync from API v2 (Multi-step)...");

                // Set User-Agent as some APIs require it
                if (!_httpClient.DefaultRequestHeaders.Contains("User-Agent"))
                {
                    _httpClient.DefaultRequestHeaders.Add("User-Agent", "NexaHRM-ERP-System");
                }

                // Step 1: Get list of provinces from /p/
                var provincesResponse = await _httpClient.GetAsync(EXTERNAL_API_V2_URL);
                provincesResponse.EnsureSuccessStatusCode();
                var provincesJson = await provincesResponse.Content.ReadAsStringAsync();
                using var provincesDoc = JsonDocument.Parse(provincesJson);

                // Clear existing merged data
                await _dbContext.Database.ExecuteSqlRawAsync("DELETE FROM MergedWards");
                await _dbContext.Database.ExecuteSqlRawAsync("DELETE FROM MergedProvinces");

                foreach (var provinceBase in provincesDoc.RootElement.EnumerateArray())
                {
                    var provinceCode = provinceBase.GetProperty("code").ToString();
                    var provinceName = provinceBase.GetProperty("name").GetString() ?? "";

                    _logger.LogInformation("Syncing merged data for province: {Name}...", provinceName);

                    // Step 2: Fetch detail for each province with depth=2 (to get districts/wards)
                    try 
                    {
                        var detailResponse = await _httpClient.GetAsync($"{EXTERNAL_API_V2_DETAIL}{provinceCode}?depth=2");
                        if (!detailResponse.IsSuccessStatusCode) continue;

                        var detailJson = await detailResponse.Content.ReadAsStringAsync();
                        using var detailDoc = JsonDocument.Parse(detailJson);
                        var provinceElement = detailDoc.RootElement;

                        var p = new MergedProvinces
                        {
                            code = provinceCode,
                            name = provinceName,
                            country_code = "VN",
                            CreatedAt = DateTime.UtcNow
                        };

                        // Extract all wards (from districts or direct) and link to Province
                        if (provinceElement.TryGetProperty("districts", out var districtsElement))
                        {
                            foreach (var districtElement in districtsElement.EnumerateArray())
                            {
                                if (districtElement.TryGetProperty("wards", out var wardsElement))
                                {
                                    foreach (var wardElement in wardsElement.EnumerateArray())
                                    {
                                        p.Wards.Add(new MergedWards
                                        {
                                            code = wardElement.GetProperty("code").ToString(),
                                            name = wardElement.GetProperty("name").GetString() ?? "",
                                            province_code = provinceCode,
                                            CreatedAt = DateTime.UtcNow
                                        });
                                    }
                                }
                            }
                        }
                        
                        if (provinceElement.TryGetProperty("wards", out var directWardsElement))
                        {
                            foreach (var wardElement in directWardsElement.EnumerateArray())
                            {
                                // Check if already added to prevent duplicates (some APIs might repeat)
                                var wCode = wardElement.GetProperty("code").ToString();
                                if (!p.Wards.Any(w => w.code == wCode))
                                {
                                    p.Wards.Add(new MergedWards
                                    {
                                        code = wCode,
                                        name = wardElement.GetProperty("name").GetString() ?? "",
                                        province_code = provinceCode,
                                        CreatedAt = DateTime.UtcNow
                                    });
                                }
                            }
                        }

                        _dbContext.MergedProvinces.Add(p);
                        await _dbContext.SaveChangesAsync(); 
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to sync details for province {Code}", provinceCode);
                    }
                }

                // Clear caches
                _memoryCache.Remove(MERGED_PROVINCES_CACHE_KEY);
                _logger.LogInformation("Merged Address Data synchronized successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing merged address data from API v2.");
                throw;
            }
        }

        public async Task SyncAddressDataAsync()
        {
            try
            {
                _logger.LogInformation("Starting address data synchronization from external API...");
                var response = await _httpClient.GetFromJsonAsync<List<ProvinceApiDto>>(EXTERNAL_API_URL);

                if (response == null) return;

                // We need to disable tenant filtering if it exists for these entities
                // but since we removed ITenantEntity, it shouldn't be an issue.
                
                var existingProvinces = await _dbContext.Provinces.ToDictionaryAsync(p => p.code);
                var existingDistricts = await _dbContext.Districts.ToDictionaryAsync(d => d.code);
                var existingWards = await _dbContext.Wards.ToDictionaryAsync(w => w.code);

                foreach (var pDto in response)
                {
                    if (!existingProvinces.TryGetValue(pDto.code.ToString(), out var province))
                    {
                        province = new Provinces
                        {
                            code = pDto.code.ToString(),
                            name = pDto.name,
                            country_code = "VN",
                            CreatedAt = DateTime.UtcNow
                        };
                        _dbContext.Provinces.Add(province);
                    }
                    else
                    {
                        province.name = pDto.name;
                        province.country_code = "VN";
                        province.UpdatedAt = DateTime.UtcNow;
                    }

                    foreach (var dDto in pDto.districts)
                    {
                        if (!existingDistricts.TryGetValue(dDto.code.ToString(), out var district))
                        {
                            district = new Districts
                            {
                                code = dDto.code.ToString(),
                                name = dDto.name,
                                province_code = pDto.code.ToString(),
                                CreatedAt = DateTime.UtcNow
                            };
                            _dbContext.Districts.Add(district);
                        }
                        else
                        {
                            district.name = dDto.name;
                            district.province_code = pDto.code.ToString();
                            district.UpdatedAt = DateTime.UtcNow;
                        }

                        foreach (var wDto in dDto.wards)
                        {
                            if (!existingWards.TryGetValue(wDto.code.ToString(), out var ward))
                            {
                                ward = new Wards
                                {
                                    code = wDto.code.ToString(),
                                    name = wDto.name,
                                    district_code = dDto.code.ToString(),
                                    CreatedAt = DateTime.UtcNow
                                };
                                _dbContext.Wards.Add(ward);
                            }
                            else
                            {
                                ward.name = wDto.name;
                                ward.district_code = dDto.code.ToString();
                                ward.UpdatedAt = DateTime.UtcNow;
                            }
                        }
                    }
                }

                await _dbContext.SaveChangesAsync();
                _logger.LogInformation("Address data synchronization completed successfully.");

                // Clear cache after sync
                // In a production environment, you might want to be more selective
                // but here clearing everything related to addresses is fine.
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during address data synchronization.");
                throw;
            }
        }

        private class ProvinceApiDto
        {
            public string name { get; set; }
            public int code { get; set; }
            public List<DistrictApiDto> districts { get; set; }
        }

        private class DistrictApiDto
        {
            public string name { get; set; }
            public int code { get; set; }
            public List<WardApiDto> wards { get; set; }
        }

        private class WardApiDto
        {
            public string name { get; set; }
            public int code { get; set; }
        }
    }
}
