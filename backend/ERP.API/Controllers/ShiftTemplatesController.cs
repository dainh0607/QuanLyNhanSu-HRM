using System;
using System.Threading.Tasks;
using ERP.DTOs.Attendance;
using ERP.Services.Attendance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/shift-templates")]
    [Authorize]
    public class ShiftTemplatesController : ControllerBase
    {
        private readonly IShiftTemplateService _templateService;

        public ShiftTemplatesController(IShiftTemplateService templateService)
        {
            _templateService = templateService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTemplates()
        {
            var templates = await _templateService.GetAllTemplatesAsync();
            return Ok(templates);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTemplate([FromBody] ShiftTemplateCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var id = await _templateService.CreateTemplateAsync(dto);
                return Ok(new { Message = "Tạo mẫu ca thành công", TemplateId = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
