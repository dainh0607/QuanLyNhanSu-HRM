using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Employees;
using ERP.DTOs.Employees.Profile;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using EmployeeEntity = ERP.Entities.Models.Employees;

namespace ERP.Services.Employees
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IUnitOfWork _unitOfWork;

        public EmployeeService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PaginatedListDto<EmployeeDto>> GetPagedListAsync(int pageNumber, int pageSize, string? searchTerm, int? departmentId)
        {
            var employees = await _unitOfWork.Repository<EmployeeEntity>().GetAllAsync();
            var query = employees.AsQueryable();

            // Filtering
            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(e => (e.full_name != null && e.full_name.Contains(searchTerm)) || 
                                         (e.email != null && e.email.Contains(searchTerm)) ||
                                         e.employee_code.Contains(searchTerm));
            }

            if (departmentId.HasValue)
            {
                query = query.Where(e => e.department_id == departmentId.Value);
            }

            // Always only active employees (or as required)
            query = query.Where(e => e.is_active);

            var count = query.Count();
            var items = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(e => MapToDto(e))
                .ToList();

            return new PaginatedListDto<EmployeeDto>(items, count, pageNumber, pageSize);
        }

        public async Task<EmployeeDto?> GetByIdAsync(int id)
        {
            var employee = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(id);
            return employee != null ? MapToDto(employee) : null;
        }

        public async Task<EmployeeFullProfileDto?> GetFullProfileAsync(int id)
        {
            var employee = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(id);
            if (employee == null) return null;

            var profile = new EmployeeFullProfileDto
            {
                BasicInfo = MapToDto(employee)
            };

            // Addresses
            var addressJoins = await _unitOfWork.Repository<EmployeeAddresses>().FindAsync(x => x.employee_id == id);
            foreach (var join in addressJoins)
            {
                var addr = await _unitOfWork.Repository<Addresses>().GetByIdAsync(join.address_id);
                var addrType = await _unitOfWork.Repository<AddressTypes>().GetByIdAsync(join.address_type_id);
                if (addr != null)
                {
                    profile.Addresses.Add(new EmployeeAddressDto
                    {
                        AddressId = join.address_id,
                        Address = new AddressDto
                        {
                            Id = addr.Id,
                            AddressLine = addr.address_line,
                            Ward = addr.ward,
                            District = addr.district,
                            City = addr.city,
                            Country = addr.country,
                            PostalCode = addr.postal_code
                        },
                        AddressTypeId = join.address_type_id,
                        AddressTypeName = addrType?.name,
                        IsCurrent = join.is_current,
                        StartDate = join.start_date,
                        EndDate = join.end_date
                    });
                }
            }

            // Bank Accounts
            var bankAccounts = await _unitOfWork.Repository<BankAccounts>().FindAsync(x => x.employee_id == id);
            profile.BankAccounts = bankAccounts.Select(b => new BankAccountDto
            {
                Id = b.Id,
                AccountHolder = b.account_holder,
                AccountNumber = b.account_number,
                BankName = b.bank_name,
                Branch = b.branch
            }).ToList();

            // Emergency Contacts
            var emergencyContacts = await _unitOfWork.Repository<EmergencyContacts>().FindAsync(x => x.employee_id == id);
            profile.EmergencyContacts = emergencyContacts.Select(c => new EmergencyContactDto
            {
                Id = c.Id,
                Name = c.name,
                Relationship = c.relationship,
                MobilePhone = c.mobile_phone,
                HomePhone = c.home_phone,
                Address = c.address
            }).ToList();

            // Health Record
            var healthRecord = (await _unitOfWork.Repository<HealthRecords>().FindAsync(x => x.employee_id == id)).FirstOrDefault();
            if (healthRecord != null)
            {
                profile.HealthRecord = new HealthRecordDto
                {
                    Id = healthRecord.Id,
                    Height = healthRecord.height,
                    Weight = healthRecord.weight,
                    BloodType = healthRecord.blood_type,
                    CongenitalDisease = healthRecord.congenital_disease,
                    ChronicDisease = healthRecord.chronic_disease,
                    HealthStatus = healthRecord.health_status,
                    CheckDate = healthRecord.check_date
                };
            }

            // Dependents
            var dependents = await _unitOfWork.Repository<Dependents>().FindAsync(x => x.employee_id == id);
            profile.Dependents = dependents.Select(d => new DependentDto
            {
                Id = d.Id,
                FullName = d.full_name,
                BirthDate = d.birth_date,
                IdentityNumber = d.identity_number,
                Relationship = d.relationship,
                PermanentAddress = d.permanent_address,
                TemporaryAddress = d.temporary_address,
                DependentDuration = d.dependent_duration,
                Reason = d.reason
            }).ToList();

            // Education
            var education = await _unitOfWork.Repository<Education>().FindAsync(x => x.employee_id == id);
            profile.Education = education.Select(e => new EducationDto
            {
                Id = e.Id,
                Level = e.level,
                Major = e.major,
                Institution = e.institution,
                IssueDate = e.issue_date,
                Note = e.note
            }).ToList();

            // Certificates
            var certJoins = await _unitOfWork.Repository<EmployeeCertificates>().FindAsync(x => x.employee_id == id);
            foreach (var join in certJoins)
            {
                var cert = await _unitOfWork.Repository<Certificates>().GetByIdAsync(join.certificate_id);
                profile.Certificates.Add(new EmployeeCertificateDto
                {
                    CertificateId = join.certificate_id,
                    CertificateName = cert?.certificate_name ?? "",
                    IssueDate = join.issue_date,
                    Attachment = join.attachment
                });
            }

            // Skills
            var skillJoins = await _unitOfWork.Repository<EmployeeSkills>().FindAsync(x => x.employee_id == id);
            foreach (var join in skillJoins)
            {
                var skill = await _unitOfWork.Repository<Skills>().GetByIdAsync(join.skill_id);
                profile.Skills.Add(new EmployeeSkillDto
                {
                    SkillId = join.skill_id,
                    SkillName = skill?.skill_name ?? "",
                    Level = join.level
                });
            }

            return profile;
        }

        public async Task<EmployeeDto?> GetByCodeAsync(string code)
        {
            var employees = await _unitOfWork.Repository<EmployeeEntity>().FindAsync(e => e.employee_code == code);
            var employee = employees.FirstOrDefault();
            return employee != null ? MapToDto(employee) : null;
        }

        public async Task<EmployeeDto> CreateAsync(EmployeeCreateDto dto)
        {
            var employee = new EmployeeEntity
            {
                employee_code = dto.EmployeeCode,
                full_name = dto.FullName,
                email = dto.Email,
                phone = dto.Phone,
                birth_date = dto.BirthDate,
                gender_code = dto.GenderCode,
                marital_status_code = dto.MaritalStatusCode,
                department_id = dto.DepartmentId,
                job_title_id = dto.JobTitleId,
                branch_id = dto.BranchId,
                manager_id = dto.ManagerId,
                start_date = dto.StartDate,
                identity_number = dto.IdentityNumber,
                is_active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<EmployeeEntity>().AddAsync(employee);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(employee);
        }

        public async Task<bool> UpdateAsync(int id, EmployeeUpdateDto dto)
        {
            var employee = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(id);
            if (employee == null) return false;

            employee.full_name = dto.FullName;
            employee.email = dto.Email;
            employee.phone = dto.Phone;
            employee.birth_date = dto.BirthDate;
            employee.gender_code = dto.GenderCode;
            employee.marital_status_code = dto.MaritalStatusCode;
            employee.department_id = dto.DepartmentId;
            employee.job_title_id = dto.JobTitleId;
            employee.branch_id = dto.BranchId;
            employee.manager_id = dto.ManagerId;
            employee.start_date = dto.StartDate;
            employee.identity_number = dto.IdentityNumber;
            employee.work_email = dto.WorkEmail;
            employee.avatar = dto.Avatar;
            employee.is_active = dto.IsActive;
            employee.is_resigned = dto.IsResigned;
            employee.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<EmployeeEntity>().Update(employee);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var employee = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(id);
            if (employee == null) return false;

            employee.is_active = false; // Soft delete
            employee.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<EmployeeEntity>().Update(employee);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        private EmployeeDto MapToDto(EmployeeEntity e)
        {
            return new EmployeeDto
            {
                Id = e.Id,
                EmployeeCode = e.employee_code,
                FullName = e.full_name,
                BirthDate = e.birth_date,
                Email = e.email,
                Phone = e.phone,
                IdentityNumber = e.identity_number,
                StartDate = e.start_date,
                IsActive = e.is_active,
                IsResigned = e.is_resigned,
                DepartmentId = e.department_id,
                JobTitleId = e.job_title_id,
                BranchId = e.branch_id,
                ManagerId = e.manager_id,
                WorkEmail = e.work_email,
                Avatar = e.avatar
            };
        }
    }
}
