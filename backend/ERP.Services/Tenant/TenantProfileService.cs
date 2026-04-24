using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.DTOs.Tenant;
using ERP.Entities.Interfaces;
using System.Linq;

namespace ERP.Services.Tenant
{
    public class TenantProfileService : ITenantProfileService
    {
        private readonly AppDbContext _db;
        private readonly ICurrentUserContext _currentUserContext;
        private readonly Common.IStorageService _storageService;

        public TenantProfileService(AppDbContext db, ICurrentUserContext currentUserContext, Common.IStorageService storageService)
        {
            _db = db;
            _currentUserContext = currentUserContext;
            _storageService = storageService;
        }

        public async Task<TenantProfileDto> GetProfileAsync()
        {
            var tenantId = _currentUserContext.TenantId ?? throw new UnauthorizedAccessException("Tenant context missing");

            var tenant = await _db.Tenants
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenant == null) throw new Exception("Tenant not found");

            var profile = await _db.TenantProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.tenant_id == tenantId);

            return new TenantProfileDto
            {
                CompanyName = tenant.name,
                CompanyEmail = profile?.company_email,
                EstablishmentDate = profile?.establishment_date,
                CompanySize = profile?.company_size,
                CharterCapital = profile?.charter_capital,
                BankName = profile?.bank_name,
                BankAccountNo = profile?.bank_account_no,
                TaxCode = profile?.tax_code,
                Address = profile?.address,
                CountryCode = profile?.country_code,
                ProvinceCode = profile?.province_code,
                DistrictCode = profile?.district_code,
                DateFormat = profile?.date_format ?? "DD/MM/YYYY",
                TimeFormat = profile?.time_format ?? "24H",
                LogoUrl = profile?.logo_url,
                ThemeColor = profile?.theme_color,
                Subdomain = tenant.subdomain,
                Notes = profile?.notes
            };
        }

        public async Task<bool> UpdateProfileAsync(TenantProfileUpdateDto updateDto)
        {
            var tenantId = _currentUserContext.TenantId ?? throw new UnauthorizedAccessException("Tenant context missing");

            // Update Tenant Name and Subdomain
            var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);
            if (tenant == null) throw new Exception("Tenant not found");

            if (string.IsNullOrWhiteSpace(updateDto.CompanyName))
                throw new ArgumentException("Company name is required");

            tenant.name = updateDto.CompanyName;

            // Handle Subdomain change and validation
            if (!string.IsNullOrWhiteSpace(updateDto.Subdomain))
            {
                var cleanSubdomain = updateDto.Subdomain.Trim().ToLower();
                
                // Regex validation: a-z, 0-9, dash
                if (!System.Text.RegularExpressions.Regex.IsMatch(cleanSubdomain, "^[a-z0-9-]+$"))
                {
                    throw new ArgumentException("Tên miền chỉ được chứa chữ cái không dấu, số và dấu gạch ngang.");
                }

                if (tenant.subdomain != cleanSubdomain)
                {
                    // Check Global Uniqueness
                    var exists = await _db.Tenants.AnyAsync(t => t.subdomain == cleanSubdomain && t.Id != tenantId);
                    if (exists)
                    {
                        throw new InvalidOperationException("Tên miền này đã được sử dụng, vui lòng chọn tên khác.");
                    }
                    tenant.subdomain = cleanSubdomain;
                }
            }

            // Update or Create Profile
            var profile = await _db.TenantProfiles.FirstOrDefaultAsync(p => p.tenant_id == tenantId);
            
            if (profile == null)
            {
                profile = new TenantProfiles { tenant_id = tenantId };
                _db.TenantProfiles.Add(profile);
            }

            profile.company_email = updateDto.CompanyEmail;
            profile.establishment_date = updateDto.EstablishmentDate;
            profile.company_size = updateDto.CompanySize;
            profile.charter_capital = updateDto.CharterCapital;
            profile.bank_name = updateDto.BankName;
            profile.bank_account_no = updateDto.BankAccountNo;
            profile.tax_code = updateDto.TaxCode;
            profile.address = updateDto.Address;
            profile.country_code = updateDto.CountryCode;
            profile.province_code = updateDto.ProvinceCode;
            profile.district_code = updateDto.DistrictCode;
            profile.date_format = updateDto.DateFormat;
            profile.time_format = updateDto.TimeFormat;
            profile.logo_url = updateDto.LogoUrl;
            profile.theme_color = updateDto.ThemeColor;
            profile.notes = updateDto.Notes;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<string> UploadLogoAsync(System.IO.Stream fileStream, string fileName, string contentType)
        {
            var url = await _storageService.UploadFileAsync(fileStream, fileName, contentType);
            return url;
        }

        public async Task<BrandingDto?> GetBrandingBySubdomainAsync(string subdomain)
        {
            if (string.IsNullOrWhiteSpace(subdomain)) return null;

            var cleanSubdomain = subdomain.Trim().ToLower();

            var tenant = await _db.Tenants
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.subdomain == cleanSubdomain);

            if (tenant == null) return null;

            var profile = await _db.TenantProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.tenant_id == tenant.Id);

            return new BrandingDto
            {
                CompanyName = tenant.name,
                LogoUrl = profile?.logo_url,
                ThemeColor = profile?.theme_color
            };
        }
    }
}
