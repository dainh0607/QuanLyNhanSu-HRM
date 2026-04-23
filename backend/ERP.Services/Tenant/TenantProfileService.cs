using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.DTOs.Tenant;
using ERP.Entities.Interfaces;

namespace ERP.Services.Tenant
{
    public class TenantProfileService : ITenantProfileService
    {
        private readonly AppDbContext _db;
        private readonly ICurrentUserContext _currentUserContext;

        public TenantProfileService(AppDbContext db, ICurrentUserContext currentUserContext)
        {
            _db = db;
            _currentUserContext = currentUserContext;
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
                Notes = profile?.notes
            };
        }

        public async Task<bool> UpdateProfileAsync(TenantProfileUpdateDto updateDto)
        {
            var tenantId = _currentUserContext.TenantId ?? throw new UnauthorizedAccessException("Tenant context missing");

            // Update Tenant Name
            var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);
            if (tenant == null) throw new Exception("Tenant not found");

            if (string.IsNullOrWhiteSpace(updateDto.CompanyName))
                throw new ArgumentException("Company name is required");

            tenant.name = updateDto.CompanyName;

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
            profile.notes = updateDto.Notes;

            await _db.SaveChangesAsync();
            return true;
        }
    }
}
