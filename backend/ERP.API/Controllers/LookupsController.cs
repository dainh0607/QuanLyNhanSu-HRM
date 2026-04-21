using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.Services.Employees;
using ERP.Services.Lookup;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LookupsController : ControllerBase
    {
        private readonly ILookupService _lookupService;

        public LookupsController(ILookupService lookupService)
        {
            _lookupService = lookupService;
        }

        [HttpGet("genders")]
        public async Task<IActionResult> GetGenders() => Ok(await _lookupService.GetGendersAsync());

        [HttpGet("marital-statuses")]
        public async Task<IActionResult> GetMaritalStatuses() => Ok(await _lookupService.GetMaritalStatusesAsync());

        [HttpGet("countries")]
        public async Task<IActionResult> GetCountries() => Ok(await _lookupService.GetCountriesAsync());

        [HttpGet("provinces/{countryCode}")]
        public async Task<IActionResult> GetProvinces(string countryCode) => Ok(await _lookupService.GetProvincesAsync(countryCode));

        [HttpGet("districts/{provinceCode}")]
        public async Task<IActionResult> GetDistricts(string provinceCode) => Ok(await _lookupService.GetDistrictsAsync(provinceCode));

        [HttpGet("education-levels")]
        public async Task<IActionResult> GetEducationLevels() => Ok(await _lookupService.GetEducationLevelsAsync());

        [HttpGet("majors")]
        public async Task<IActionResult> GetMajors() => Ok(await _lookupService.GetMajorsAsync());

        [HttpGet("contract-types")]
        public async Task<IActionResult> GetContractTypes() => Ok(await _lookupService.GetContractTypesAsync());

        [HttpGet("tax-types")]
        public async Task<IActionResult> GetTaxTypes() => Ok(await _lookupService.GetTaxTypesAsync());

        [HttpGet("branches")]
        public async Task<IActionResult> GetBranches() => Ok(await _lookupService.GetBranchesLookupAsync());

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments([FromQuery] List<int>? branchIds, [FromQuery] int? branchId)
        {
            var targetIds = new List<int>();
            if (branchId.HasValue) targetIds.Add(branchId.Value);
            if (branchIds != null) targetIds.AddRange(branchIds);
            return Ok(await _lookupService.GetDepartmentsLookupAsync(targetIds.Any() ? targetIds : null));
        }

        [HttpGet("job-titles")]
        public async Task<IActionResult> GetJobTitles([FromQuery] List<int>? branchIds, [FromQuery] int? branchId)
        {
            var targetIds = new List<int>();
            if (branchId.HasValue) targetIds.Add(branchId.Value);
            if (branchIds != null) targetIds.AddRange(branchIds);
            return Ok(await _lookupService.GetJobTitlesLookupAsync(targetIds.Any() ? targetIds : null));
        }

        [HttpGet("salary-grades")]
        public async Task<IActionResult> GetSalaryGrades([FromServices] ISalaryConfigurationService salaryService) => Ok(await salaryService.GetSalaryGradesAsync());

        [HttpGet("allowance-types")]
        public async Task<IActionResult> GetAllowanceTypes([FromServices] ISalaryConfigurationService salaryService) => Ok(await salaryService.GetAllowanceTypesAsync());

        [HttpGet("income-types")]
        public async Task<IActionResult> GetIncomeTypes([FromServices] ISalaryConfigurationService salaryService) => Ok(await salaryService.GetIncomeTypesAsync());
    }
}
