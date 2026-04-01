using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Employees.Profile;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using EmployeeEntity = ERP.Entities.Models.Employees;

namespace ERP.Services.Employees
{
    public class EmployeeProfileService : IEmployeeProfileService
    {
        private readonly IUnitOfWork _unitOfWork;

        public EmployeeProfileService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> UpdateBankAccountsAsync(int employeeId, List<BankAccountDto> dtos)
        {
            var existing = await _unitOfWork.Repository<BankAccounts>().FindAsync(x => x.employee_id == employeeId);
            _unitOfWork.Repository<BankAccounts>().RemoveRange(existing);

            var newEntities = dtos.Select(d => new BankAccounts
            {
                employee_id = employeeId,
                account_holder = d.AccountHolder,
                account_number = d.AccountNumber,
                bank_name = d.BankName,
                branch = d.Branch
            });

            await _unitOfWork.Repository<BankAccounts>().AddRangeAsync(newEntities);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateEmergencyContactsAsync(int employeeId, List<EmergencyContactDto> dtos)
        {
            var existing = await _unitOfWork.Repository<EmergencyContacts>().FindAsync(x => x.employee_id == employeeId);
            _unitOfWork.Repository<EmergencyContacts>().RemoveRange(existing);

            var newEntities = dtos.Select(d => new EmergencyContacts
            {
                employee_id = employeeId,
                name = d.Name,
                relationship = d.Relationship,
                mobile_phone = d.MobilePhone,
                home_phone = d.HomePhone,
                address = d.Address
            });

            await _unitOfWork.Repository<EmergencyContacts>().AddRangeAsync(newEntities);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateHealthRecordAsync(int employeeId, HealthRecordDto dto)
        {
            var existing = (await _unitOfWork.Repository<HealthRecords>().FindAsync(x => x.employee_id == employeeId)).FirstOrDefault();
            
            if (existing != null)
            {
                existing.height = dto.Height;
                existing.weight = dto.Weight;
                existing.blood_type = dto.BloodType;
                existing.congenital_disease = dto.CongenitalDisease;
                existing.chronic_disease = dto.ChronicDisease;
                existing.health_status = dto.HealthStatus;
                existing.check_date = dto.CheckDate;
                _unitOfWork.Repository<HealthRecords>().Update(existing);
            }
            else
            {
                var newEntity = new HealthRecords
                {
                    employee_id = employeeId,
                    height = dto.Height,
                    weight = dto.Weight,
                    blood_type = dto.BloodType,
                    congenital_disease = dto.CongenitalDisease,
                    chronic_disease = dto.ChronicDisease,
                    health_status = dto.HealthStatus,
                    check_date = dto.CheckDate
                };
                await _unitOfWork.Repository<HealthRecords>().AddAsync(newEntity);
            }

            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateAddressesAsync(int employeeId, AddressProfileUpdateDto dto)
        {
            var employee = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(employeeId);
            if (employee == null) return false;

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // AC 3.2 Update Employee base fields
                employee.origin_place = dto.OriginPlace?.Trim();
                // Assumed field for Current Address if exists on employee, otherwise skipped
                // employee.current_address = dto.CurrentAddress; 
                _unitOfWork.Repository<EmployeeEntity>().Update(employee);

                // Clear existing specific address types (1: Permanent, 3: Merged)
                var existingAddresses = await _unitOfWork.Repository<EmployeeAddresses>()
                    .FindAsync(x => x.employee_id == employeeId && (x.address_type_id == 1 || x.address_type_id == 3));
                _unitOfWork.Repository<EmployeeAddresses>().RemoveRange(existingAddresses);

                // Function to add address if not empty
                async Task AddAddress(AddressDto addrDto, int typeId, bool isCurrent)
                {
                    if (string.IsNullOrWhiteSpace(addrDto.AddressLine) &&
                        string.IsNullOrWhiteSpace(addrDto.Ward) &&
                        string.IsNullOrWhiteSpace(addrDto.District) &&
                        string.IsNullOrWhiteSpace(addrDto.City) &&
                        string.IsNullOrWhiteSpace(addrDto.Country))
                    {
                        return;
                    }

                    var addr = new Addresses
                    {
                        address_line = addrDto.AddressLine ?? string.Empty,
                        ward = addrDto.Ward ?? string.Empty,
                        district = addrDto.District ?? string.Empty,
                        city = addrDto.City ?? string.Empty,
                        country = addrDto.Country ?? string.Empty,
                        postal_code = addrDto.PostalCode ?? string.Empty
                    };
                    await _unitOfWork.Repository<Addresses>().AddAsync(addr);
                    await _unitOfWork.SaveChangesAsync();

                    var join = new EmployeeAddresses
                    {
                        employee_id = employeeId,
                        address_id = addr.Id,
                        address_type_id = typeId,
                        is_current = isCurrent,
                        start_date = DateTime.UtcNow
                    };
                    await _unitOfWork.Repository<EmployeeAddresses>().AddAsync(join);
                }

                // Save Permanent Address (AC 3.1)
                if (dto.PermanentAddress != null)
                {
                    await AddAddress(dto.PermanentAddress, 1, true);
                }

                // Save Merged Address (AC 3.1)
                if (dto.MergedAddress != null)
                {
                    await AddAddress(dto.MergedAddress, 3, false);
                }

                // Handle Additional Addresses if any
                if (dto.AdditionalAddresses != null)
                {
                    foreach (var addr in dto.AdditionalAddresses)
                    {
                        if (addr.Address != null)
                            await AddAddress(addr.Address, addr.AddressTypeId, addr.IsCurrent);
                    }
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return true;
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<bool> UpdateEducationAsync(int employeeId, List<EducationDto> dtos)
        {
            var existing = await _unitOfWork.Repository<Education>().FindAsync(x => x.employee_id == employeeId);
            _unitOfWork.Repository<Education>().RemoveRange(existing);

            var newEntities = dtos.Select(d => new Education
            {
                employee_id = employeeId,
                level = d.Level,
                major = d.Major,
                institution = d.Institution,
                issue_date = d.IssueDate,
                note = d.Note
            });

            await _unitOfWork.Repository<Education>().AddRangeAsync(newEntities);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateSkillsAsync(int employeeId, List<EmployeeSkillDto> dtos)
        {
            var existing = await _unitOfWork.Repository<EmployeeSkills>().FindAsync(x => x.employee_id == employeeId);
            _unitOfWork.Repository<EmployeeSkills>().RemoveRange(existing);

            var newEntities = dtos.Select(d => new EmployeeSkills
            {
                employee_id = employeeId,
                skill_id = d.SkillId,
                level = d.Level
            });

            await _unitOfWork.Repository<EmployeeSkills>().AddRangeAsync(newEntities);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateCertificatesAsync(int employeeId, List<EmployeeCertificateDto> dtos)
        {
            var existing = await _unitOfWork.Repository<EmployeeCertificates>().FindAsync(x => x.employee_id == employeeId);
            _unitOfWork.Repository<EmployeeCertificates>().RemoveRange(existing);

            var newEntities = dtos.Select(d => new EmployeeCertificates
            {
                employee_id = employeeId,
                certificate_id = d.CertificateId,
                issue_date = d.IssueDate,
                attachment = d.Attachment
            });

            await _unitOfWork.Repository<EmployeeCertificates>().AddRangeAsync(newEntities);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateDependentsAsync(int employeeId, List<DependentDto> dtos)
        {
            var existing = await _unitOfWork.Repository<Dependents>().FindAsync(x => x.employee_id == employeeId);
            _unitOfWork.Repository<Dependents>().RemoveRange(existing);

            var newEntities = dtos.Select(d => new Dependents
            {
                employee_id = employeeId,
                full_name = d.FullName,
                birth_date = d.BirthDate,
                identity_number = d.IdentityNumber,
                relationship = d.Relationship,
                permanent_address = d.PermanentAddress,
                temporary_address = d.TemporaryAddress,
                dependent_duration = d.DependentDuration,
                reason = d.Reason
            });

            await _unitOfWork.Repository<Dependents>().AddRangeAsync(newEntities);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateIdentityInfoAsync(int employeeId, IdentityInfoDto dto)
        {
            var emp = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(employeeId);
            if (emp == null) return false;

            emp.identity_number = dto.IdentityNumber;
            emp.identity_issue_date = dto.IdentityIssueDate;
            emp.identity_issue_place = dto.IdentityIssuePlace;
            emp.passport = dto.Passport;
            emp.nationality = dto.Nationality;
            emp.ethnicity = dto.Ethnicity;
            emp.religion = dto.Religion;

            _unitOfWork.Repository<EmployeeEntity>().Update(emp);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateContactInfoAsync(int employeeId, ContactInfoDto dto)
        {
            var emp = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(employeeId);
            if (emp == null) return false;

            emp.phone = dto.Phone;
            emp.home_phone = dto.HomePhone;
            emp.email = dto.Email;
            emp.work_email = dto.WorkEmail;
            emp.facebook = dto.Facebook;

            _unitOfWork.Repository<EmployeeEntity>().Update(emp);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateBasicInfoAsync(int employeeId, BasicInfoDto dto)
        {
            var emp = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(employeeId);
            if (emp == null) return false;

            emp.full_name = dto.FullName;
            emp.birth_date = dto.BirthDate;
            emp.gender_code = dto.GenderCode;
            emp.marital_status_code = dto.MaritalStatusCode;
            emp.department_id = dto.DepartmentId;
            emp.job_title_id = dto.JobTitleId;
            emp.branch_id = dto.BranchId;
            emp.manager_id = dto.ManagerId;
            emp.start_date = dto.StartDate;
            emp.avatar = dto.Avatar;

            _unitOfWork.Repository<EmployeeEntity>().Update(emp);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }
    
        public async Task<bool> UpdateWorkHistoryAsync(int employeeId, List<WorkHistoryDto> dtos)
        {
            var existing = await _unitOfWork.Repository<WorkHistory>().FindAsync(x => x.employee_id == employeeId);
            _unitOfWork.Repository<WorkHistory>().RemoveRange(existing);
    
            var newEntities = dtos.Select(d => new WorkHistory
            {
                employee_id = employeeId,
                company_name = d.CompanyName,
                job_title = d.JobTitle,
                work_duration = d.WorkDuration,
                start_date = d.StartDate,
                end_date = d.EndDate,
                is_current = d.IsCurrent
            });
    
            await _unitOfWork.Repository<WorkHistory>().AddRangeAsync(newEntities);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        // ─── Thông tin khác (AC 8) ────────────────────────────────────────────────

        /// <summary>
        /// Lấy dữ liệu cụm "Thông tin khác" của nhân viên theo AC 8.3.
        /// Trả về null nếu nhân viên không tồn tại.
        /// Nếu marital_status_code chưa có, mặc định trả về "SINGLE".
        /// </summary>
        public async Task<OtherInfoDto?> GetOtherInfoAsync(int employeeId)
        {
            var emp = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(employeeId);
            if (emp == null) return null;

            return new OtherInfoDto
            {
                UnionGroup       = emp.union_member ? "Đoàn viên" : null,
                Ethnicity        = emp.ethnicity,
                Religion         = emp.religion,
                TaxCode          = emp.tax_code,
                MaritalStatusCode = string.IsNullOrWhiteSpace(emp.marital_status_code)
                                        ? "SINGLE"
                                        : emp.marital_status_code,
                Note             = emp.note
            };
        }

        /// <summary>
        /// Cập nhật cụm "Thông tin khác" của nhân viên theo AC 8.4.
        /// Mapping UnionGroup -> union_member (true nếu có giá trị, false nếu rỗng/null).
        /// </summary>
        public async Task<bool> UpdateOtherInfoAsync(int employeeId, OtherInfoDto dto)
        {
            var emp = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(employeeId);
            if (emp == null) return false;

            emp.union_member       = !string.IsNullOrWhiteSpace(dto.UnionGroup);
            emp.ethnicity          = dto.Ethnicity;
            emp.religion           = dto.Religion;
            emp.tax_code           = dto.TaxCode;
            emp.marital_status_code = string.IsNullOrWhiteSpace(dto.MaritalStatusCode)
                                         ? "SINGLE"
                                         : dto.MaritalStatusCode;
            emp.note               = dto.Note;

            _unitOfWork.Repository<EmployeeEntity>().Update(emp);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }
    }
}
