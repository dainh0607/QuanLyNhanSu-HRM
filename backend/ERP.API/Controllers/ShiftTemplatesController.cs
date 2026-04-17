using System;
using System.Threading.Tasks;
using ERP.DTOs.Attendance;
using ERP.Services.Attendance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/shift-templates")]
    [Authorize]
    [HasPermission("attendance", "read")]
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTemplateById(int id)
        {
            try
            {
                var template = await _templateService.GetTemplateByIdAsync(id);
                if (template == null) return NotFound(new { Message = "KhĂ´ng tĂ¬m tháº¥y máº«u ca." });
                return Ok(template);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost]
        [HasPermission("attendance", "update")]
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

        [HttpPut("{id}")]
        [HasPermission("attendance", "update")]
        public async Task<IActionResult> UpdateTemplate(int id, [FromBody] ShiftTemplateCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var success = await _templateService.UpdateTemplateAsync(id, dto);
                if (!success) return NotFound(new { Message = "KhĂ´ng tĂ¬m tháº¥y máº«u ca." });
                return Ok(new { Message = "Cáº­p nháº­t máº«u ca thĂ nh cĂ´ng." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [HasPermission("attendance", "update")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            try
            {
                var success = await _templateService.DeleteTemplateAsync(id);
                if (!success) return NotFound(new { Message = "KhĂ´ng tĂ¬m tháº¥y máº«u ca." });
                return Ok(new { Message = "XĂ³a máº«u ca thĂ nh cĂ´ng." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
