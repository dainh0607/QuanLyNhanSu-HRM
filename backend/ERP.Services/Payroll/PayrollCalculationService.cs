using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.Entities.Models;
using ERP.Entities.Interfaces;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using NCalc;

namespace ERP.Services.Payroll
{
    public class PayrollCalculationService : IPayrollCalculationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PayrollCalculationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<decimal> CalculateSalaryAsync(int employeeId, int periodId, string formula)
        {
            if (string.IsNullOrEmpty(formula)) return 0;

            var variables = await GetEmployeeVariablesAsync(employeeId, periodId);
            
            try
            {
                var expression = new Expression(formula);
                
                // Map variables to NCalc
                foreach (var v in variables)
                {
                    expression.Parameters[v.Key] = v.Value;
                }

                var result = expression.Evaluate();
                return Convert.ToDecimal(result);
            }
            catch (Exception ex)
            {
                // In case of math error (division by zero, etc.)
                Console.WriteLine($"Error calculating salary for Emp {employeeId}: {ex.Message}");
                return 0;
            }
        }

        public async Task<Dictionary<string, object>> GetEmployeeVariablesAsync(int employeeId, int periodId)
        {
            var variables = new Dictionary<string, object>();

            // 1. Get Employee Basic Info
            var employee = await _unitOfWork.Repository<ERP.Entities.Models.Employees>()
                .GetByIdAsync(employeeId);

            // 2. Get Basic Salary (From SalaryGrades linked via JobTitle or similar)
            // For now, let's look for any SalaryGrade matching the employee's job title or a default one
            var salaryGrade = await _unitOfWork.Repository<SalaryGrade>()
                .AsQueryable()
                .Where(sg => sg.is_active)
                .OrderByDescending(sg => sg.Id)
                .FirstOrDefaultAsync(); // Placeholder logic

            decimal baseSalary = salaryGrade?.amount ?? 0;

            // 3. Get Timekeeping Data (Mocking for now, will integrate with Attendance module later)
            decimal standardWorkDays = 26;
            decimal actualWorkDays = 26; // Default to full month if no attendance data

            // 4. Get Allowances
            decimal totalAllowances = 0; // Will sum from AllowanceEntries later

            // Populate variables
            variables.Add("BASE_SALARY", baseSalary);
            variables.Add("WORKING_DAYS_STD", standardWorkDays);
            variables.Add("WORKING_DAYS_ACT", actualWorkDays);
            variables.Add("TOTAL_ALLOWANCE", totalAllowances);
            variables.Add("TOTAL_DEDUCTION", (decimal)0);

            return variables;
        }

        public bool ValidateFormula(string formula, out string error)
        {
            error = string.Empty;
            if (string.IsNullOrEmpty(formula)) return true;

            try
            {
                var expression = new Expression(formula);
                
                // Test with dummy variables
                var testVars = new[] { "BASE_SALARY", "WORKING_DAYS_STD", "WORKING_DAYS_ACT", "TOTAL_ALLOWANCE", "TOTAL_DEDUCTION" };
                foreach (var v in testVars)
                {
                    expression.Parameters[v] = 1.0;
                }

                if (expression.HasErrors())
                {
                    error = expression.Error.ToString();
                    return false;
                }

                expression.Evaluate();
                return true;
            }
            catch (Exception ex)
            {
                error = ex.Message;
                return false;
            }
        }
    }
}
