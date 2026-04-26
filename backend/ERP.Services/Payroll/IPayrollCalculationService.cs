using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.Entities.Models;

namespace ERP.Services.Payroll
{
    public interface IPayrollCalculationService
    {
        /// <summary>
        /// Calculates salary for a single employee in a period based on a formula.
        /// </summary>
        Task<decimal> CalculateSalaryAsync(int employeeId, int periodId, string formula);

        /// <summary>
        /// Gets all available variables for an employee in a period.
        /// </summary>
        Task<Dictionary<string, object>> GetEmployeeVariablesAsync(int employeeId, int periodId);
        
        /// <summary>
        /// Validates if a formula is mathematically sound and uses valid variables.
        /// </summary>
        bool ValidateFormula(string formula, out string error);
    }
}
