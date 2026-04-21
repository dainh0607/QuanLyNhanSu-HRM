using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Employees.Profile;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Employees
{
    public class InsuranceService : IInsuranceService
    {
        private readonly IUnitOfWork _uow;
        private readonly AppDbContext _context;

        public InsuranceService(IUnitOfWork uow, AppDbContext context)
        {
            _uow = uow;
            _context = context;
        }

        public async Task<IEnumerable<InsuranceListItemDto>> GetInsurancesByEmployeeIdAsync(int employeeId)
        {
            return await _context.Insurances
                .Include(i => i.Employee)
                .Where(i => i.employee_id == employeeId)
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new InsuranceListItemDto
                {
                    Id = i.Id,
                    FullName = i.Employee.full_name,
                    SocialInsuranceNo = i.social_insurance_no,
                    HealthInsuranceNo = i.health_insurance_no,
                    JoinDate = i.join_date
                })
                .ToListAsync();
        }

        public async Task<InsuranceDto?> GetInsuranceByIdAsync(int id)
        {
            var i = await _context.Insurances
                .Include(x => x.Employee)
                    .ThenInclude(e => e.Gender)
                .Include(x => x.BirthPlaceAddress)
                .Include(x => x.ResidenceAddress)
                .Include(x => x.ContactAddress)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (i == null) return null;

            return new InsuranceDto
            {
                Id = i.Id,
                EmployeeId = i.employee_id,
                EmployeeName = i.Employee.full_name,
                EmployeeCode = i.Employee.employee_code,
                SocialInsuranceNo = i.social_insurance_no,
                HealthInsuranceNo = i.health_insurance_no,
                IsBookSubmitted = i.is_book_submitted,
                Position = i.position,
                MedicalHistory = i.medical_history,
                MaternityRegime = i.maternity_regime,
                RegistrationPlace = i.registration_place,
                JoinDate = i.join_date,
                SalaryForInsurance = i.salary_for_insurance,
                UnionFee = i.union_fee,
                Note = i.note,
                CreatedAt = i.CreatedAt,
                
                // Static context
                GenderName = i.Employee.Gender?.name,
                BirthDate = i.Employee.birth_date,
                IdentityNumber = i.Employee.identity_number,

                // Addresses
                BirthPlaceAddress = MapAddress(i.BirthPlaceAddress),
                ResidenceAddress = MapAddress(i.ResidenceAddress),
                ContactAddress = MapAddress(i.ContactAddress),

                // Rates
                CompanyContributions = new InsuranceContributionDto
                {
                    SocialRate = i.company_social_rate,
                    HealthRate = i.company_health_rate,
                    UnemploymentRate = i.company_unemployment_rate
                },
                EmployeeContributions = new InsuranceContributionDto
                {
                    SocialRate = i.employee_social_rate,
                    HealthRate = i.employee_health_rate,
                    UnemploymentRate = i.employee_unemployment_rate
                }
            };
        }

        public async Task<bool> CreateInsuranceAsync(InsuranceCreateDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Save Addresses
                var birthAddress = await SaveAddressAsync(dto.BirthPlaceAddress);
                var residenceAddress = await SaveAddressAsync(dto.ResidenceAddress);
                var contactAddress = await SaveAddressAsync(dto.ContactAddress);

                // 2. Create Insurance
                var insurance = new Insurances
                {
                    employee_id = dto.EmployeeId,
                    social_insurance_no = dto.SocialInsuranceNo,
                    health_insurance_no = dto.HealthInsuranceNo,
                    is_book_submitted = dto.IsBookSubmitted,
                    position = dto.Position,
                    medical_history = dto.MedicalHistory,
                    maternity_regime = dto.MaternityRegime,
                    registration_place = dto.RegistrationPlace,
                    join_date = dto.JoinDate,
                    salary_for_insurance = dto.SalaryForInsurance,
                    union_fee = dto.UnionFee,
                    note = dto.Note,
                    
                    birth_place_address_id = birthAddress?.Id,
                    residence_address_id = residenceAddress?.Id,
                    contact_address_id = contactAddress?.Id,

                    company_social_rate = dto.CompanyContributions?.SocialRate,
                    company_health_rate = dto.CompanyContributions?.HealthRate,
                    company_unemployment_rate = dto.CompanyContributions?.UnemploymentRate,

                    employee_social_rate = dto.EmployeeContributions?.SocialRate,
                    employee_health_rate = dto.EmployeeContributions?.HealthRate,
                    employee_unemployment_rate = dto.EmployeeContributions?.UnemploymentRate
                };

                _context.Insurances.Add(insurance);
                await _uow.SaveChangesAsync();

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteInsuranceAsync(int id)
        {
            var i = await _context.Insurances.FindAsync(id);
            if (i == null) return false;

            _context.Insurances.Remove(i);
            return await _uow.SaveChangesAsync() > 0;
        }

        private async Task<Addresses?> SaveAddressAsync(AddressDto? dto)
        {
            if (dto == null) return null;

            var address = new Addresses
            {
                address_line = dto.AddressLine ?? "",
                ward = dto.Ward ?? "",
                district = dto.District,
                district_id = dto.DistrictId,
                city = dto.City,
                province_id = dto.ProvinceId,
                country = dto.Country,
                country_id = dto.CountryId,
                postal_code = dto.PostalCode
            };

            _context.Addresses.Add(address);
            await _uow.SaveChangesAsync();
            return address;
        }

        private AddressDto? MapAddress(Addresses? a)
        {
            if (a == null) return null;
            return new AddressDto
            {
                Id = a.Id,
                AddressLine = a.address_line,
                Ward = a.ward,
                District = a.district,
                DistrictId = a.district_id,
                City = a.city,
                ProvinceId = a.province_id,
                Country = a.country,
                CountryId = a.country_id,
                PostalCode = a.postal_code
            };
        }
    }
}
