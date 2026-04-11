using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.Repositories.Interfaces;
using ERP.Entities.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MetadataController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public MetadataController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("regions")]
        public async Task<IActionResult> GetRegions()
        {
            var data = await _unitOfWork.Repository<Regions>().GetAllAsync();
            return Ok(data.Select(r => new { r.Id, r.name, r.code }));
        }

        [HttpGet("branches")]
        public async Task<IActionResult> GetBranches()
        {
            var data = await _unitOfWork.Repository<Branches>().GetAllAsync();
            return Ok(data.Select(b => new { b.Id, b.name, b.code }));
        }

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments([FromQuery] List<int>? branch_ids)
        {
            var query = _unitOfWork.Repository<Departments>().AsQueryable();
            if (branch_ids != null && branch_ids.Any())
            {
                query = query.Where(d => !d.branch_id.HasValue || branch_ids.Contains(d.branch_id.Value));
            }
            var data = await query.ToListAsync();
            return Ok(data.Select(d => new { d.Id, d.name, d.code, d.parent_id }));
        }

        [HttpGet("job-titles")]
        public async Task<IActionResult> GetJobTitles([FromQuery] List<int>? branch_ids)
        {
            var query = _unitOfWork.Repository<JobTitles>().AsQueryable();
            if (branch_ids != null && branch_ids.Any())
            {
                query = query.Where(j => !j.branch_id.HasValue || branch_ids.Contains(j.branch_id.Value));
            }
            var data = await query.ToListAsync();
            return Ok(data.Select(j => new { j.Id, j.name, j.code }));
        }

        [HttpGet("access-groups")]
        public async Task<IActionResult> GetAccessGroups()
        {
            var data = await _unitOfWork.Repository<Roles>().GetAllAsync();
            return Ok(data.Select(r => new { r.Id, name = r.name }));
        }

        [HttpGet("address-types")]
        public async Task<IActionResult> GetAddressTypes()
        {
            var data = (await _unitOfWork.Repository<AddressTypes>().GetAllAsync())
                .OrderBy(type => type.name)
                .Select(type => new { type.Id, name = type.name })
                .ToList();

            return Ok(data);
        }

        [HttpGet("address-countries")]
        public async Task<IActionResult> GetAddressCountries()
        {
            var data = (await _unitOfWork.Repository<Addresses>().GetAllAsync())
                .Select(address => address.country?.Trim())
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Distinct()
                .OrderBy(name => name)
                .Select(name => new { name })
                .ToList();

            return Ok(data);
        }

        [HttpGet("address-cities")]
        public async Task<IActionResult> GetAddressCities([FromQuery] string country)
        {
            if (string.IsNullOrWhiteSpace(country))
            {
                return Ok(Enumerable.Empty<object>());
            }

            var normalizedCountry = country.Trim();
            var data = (await _unitOfWork.Repository<Addresses>().GetAllAsync())
                .Where(address => string.Equals(address.country?.Trim(), normalizedCountry))
                .Select(address => address.city?.Trim())
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Distinct()
                .OrderBy(name => name)
                .Select(name => new { name })
                .ToList();

            return Ok(data);
        }

        [HttpGet("address-districts")]
        public async Task<IActionResult> GetAddressDistricts([FromQuery] string country, [FromQuery] string city)
        {
            if (string.IsNullOrWhiteSpace(country) || string.IsNullOrWhiteSpace(city))
            {
                return Ok(Enumerable.Empty<object>());
            }

            var normalizedCountry = country.Trim();
            var normalizedCity = city.Trim();
            var data = (await _unitOfWork.Repository<Addresses>().GetAllAsync())
                .Where(address =>
                    string.Equals(address.country?.Trim(), normalizedCountry) &&
                    string.Equals(address.city?.Trim(), normalizedCity))
                .Select(address => address.district?.Trim())
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Distinct()
                .OrderBy(name => name)
                .Select(name => new { name })
                .ToList();

            return Ok(data);
        }
    }
}
