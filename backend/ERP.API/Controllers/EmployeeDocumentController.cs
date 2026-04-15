using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Employees;
using ERP.Services.Employees;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/employee-documents")]
    [Authorize]
    [HasPermission("Employee", "View")]
    public class EmployeeDocumentController : ControllerBase
    {
        private readonly IEmployeeDocumentService _documentService;

        public EmployeeDocumentController(IEmployeeDocumentService documentService)
        {
            _documentService = documentService;
        }

        [HttpPost("{employeeId}/upload")]
        [HasPermission("Employee", "Update")]
        public async Task<IActionResult> Upload(int employeeId, [FromForm] DocumentUploadDto dto, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File không được trống");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            using var stream = file.OpenReadStream();
            var result = await _documentService.UploadDocumentAsync(employeeId, dto, stream, file.FileName, file.ContentType);

            return Ok(result);
        }

        [HttpGet("{employeeId}")]
        public async Task<IActionResult> GetDocuments(int employeeId)
        {
            var result = await _documentService.GetEmployeeDocumentsAsync(employeeId);
            return Ok(result);
        }

        [HttpDelete("{documentId}")]
        [HasPermission("Employee", "Update")]
        public async Task<IActionResult> Delete(int documentId)
        {
            var success = await _documentService.DeleteDocumentAsync(documentId);
            if (!success) return NotFound();

            return Ok(new { Message = "Xóa tài liệu thành công" });
        }
    }
}
