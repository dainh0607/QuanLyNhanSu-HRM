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
    public class SalaryConfigurationService : ISalaryConfigurationService
    {
        private readonly IUnitOfWork _uow;
        private readonly AppDbContext _context;

        public SalaryConfigurationService(IUnitOfWork uow, AppDbContext context)
        {
            _uow = uow;
            _context = context;
        }

        public async Task<SalaryPackageDto> GetSalaryPackageAsync(int employeeId)
        {
            var salary = await _context.Salaries
                .Include(s => s.VariableSalaries).ThenInclude(v => v.SalaryGrade)
                .Include(s => s.Allowances).ThenInclude(a => a.AllowanceType)
                .Include(s => s.OtherIncomes).ThenInclude(o => o.IncomeType)
                .FirstOrDefaultAsync(s => s.employee_id == employeeId);

            if (salary == null) return new SalaryPackageDto();

            return new SalaryPackageDto
            {
                BaseSalary = new BaseSalaryConfigDto
                {
                    PaymentMethod = salary.payment_method,
                    SalaryGradeId = salary.salary_grade_id,
                    Amount = salary.base_salary
                },
                VariableSalaries = salary.VariableSalaries.OrderBy(v => v.start_date).Select(v => new VariableSalaryDto
                {
                    Id = v.Id,
                    PaymentMethod = v.payment_method,
                    StartDate = v.start_date,
                    EndDate = v.end_date,
                    SalaryGradeId = v.salary_grade_id,
                    Amount = v.SalaryGrade?.amount,
                    Note = v.note
                }).ToList(),
                Allowances = salary.Allowances.Select(a => new AllowanceItemDto
                {
                    Id = a.Id,
                    AllowanceTypeId = a.allowance_type_id,
                    AllowanceTypeName = a.AllowanceType?.name,
                    Amount = a.amount
                }).ToList(),
                OtherIncomes = salary.OtherIncomes.Select(o => new OtherIncomeItemDto
                {
                    Id = o.Id,
                    IncomeTypeId = o.income_type_id,
                    IncomeTypeName = o.IncomeType?.name,
                    Amount = o.amount
                }).ToList()
            };
        }

        public async Task<bool> UpdateSalaryPackageAsync(int employeeId, SalaryPackageDto dto)
        {
            // 1. Validation for Variable Salaries Overlap
            if (dto.VariableSalaries != null && dto.VariableSalaries.Count > 1)
            {
                var sorted = dto.VariableSalaries.OrderBy(v => v.StartDate).ToList();
                for (int i = 0; i < sorted.Count - 1; i++)
                {
                    if (sorted[i].EndDate >= sorted[i + 1].StartDate)
                    {
                        throw new ArgumentException($"Dải thời gian lương thay đổi bị trùng lặp: {sorted[i].StartDate:dd/MM} - {sorted[i].EndDate:dd/MM} và {sorted[i+1].StartDate:dd/MM} - {sorted[i+1].EndDate:dd/MM}");
                    }
                }
            }

            var salary = await _context.Salaries
                .Include(s => s.VariableSalaries)
                .Include(s => s.Allowances)
                .Include(s => s.OtherIncomes)
                .FirstOrDefaultAsync(s => s.employee_id == employeeId);

            if (salary == null)
            {
                salary = new Salaries { employee_id = employeeId };
                _context.Salaries.Add(salary);
            }

            // 2. Update Base Salary
            salary.payment_method = dto.BaseSalary.PaymentMethod;
            salary.salary_grade_id = dto.BaseSalary.SalaryGradeId;
            salary.base_salary = dto.BaseSalary.Amount;

            // 3. Sync Variable Salaries
            _context.VariableSalaries.RemoveRange(salary.VariableSalaries);
            if (dto.VariableSalaries != null)
            {
                foreach (var vDto in dto.VariableSalaries)
                {
                    salary.VariableSalaries.Add(new VariableSalary
                    {
                        payment_method = vDto.PaymentMethod,
                        start_date = vDto.StartDate,
                        end_date = vDto.EndDate,
                        salary_grade_id = vDto.SalaryGradeId,
                        note = vDto.Note
                    });
                }
            }

            // 4. Sync Allowances
            _context.Allowances.RemoveRange(salary.Allowances);
            if (dto.Allowances != null)
            {
                foreach (var aDto in dto.Allowances)
                {
                    salary.Allowances.Add(new Allowances
                    {
                        allowance_type_id = aDto.AllowanceTypeId,
                        amount = aDto.Amount
                    });
                }
            }

            // 5. Sync Other Incomes
            _context.OtherIncomes.RemoveRange(salary.OtherIncomes);
            if (dto.OtherIncomes != null)
            {
                foreach (var oDto in dto.OtherIncomes)
                {
                    salary.OtherIncomes.Add(new OtherIncomes
                    {
                        income_type_id = oDto.IncomeTypeId,
                        amount = oDto.Amount
                    });
                }
            }

            await _uow.SaveChangesAsync();
            return true;
        }

        public async Task<SalaryGradeDto> CreateSalaryGradeAsync(SalaryGradeCreateDto dto)
        {
            var grade = new SalaryGrade
            {
                name = dto.Name,
                amount = dto.Amount,
                is_active = true
            };
            _context.SalaryGrades.Add(grade);
            await _uow.SaveChangesAsync();

            return new SalaryGradeDto
            {
                Id = grade.Id,
                Name = grade.name,
                Amount = grade.amount
            };
        }

        public async Task<IEnumerable<SalaryGradeDto>> GetSalaryGradesAsync()
        {
            return await _context.SalaryGrades
                .Where(g => g.is_active)
                .Select(g => new SalaryGradeDto { Id = g.Id, Name = g.name, Amount = g.amount })
                .ToListAsync();
        }

        public async Task<IEnumerable<LookupDto>> GetAllowanceTypesAsync()
        {
            return await _context.AllowanceTypes
                .Where(t => t.is_active)
                .Select(t => new LookupDto { Id = t.Id, Name = t.name })
                .ToListAsync();
        }

        public async Task<IEnumerable<LookupDto>> GetIncomeTypesAsync()
        {
            return await _context.IncomeTypes
                .Where(t => t.is_active)
                .Select(t => new LookupDto { Id = t.Id, Name = t.name })
                .ToListAsync();
        }
    }
}
