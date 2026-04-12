using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using ERP.Services.Common;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly string _uploadPath;
        private readonly IDocxService _docxService;
        private readonly IPdfService _pdfService;

        public UploadController(IDocxService docxService, IPdfService pdfService)
        {
            _docxService = docxService;
            _pdfService = pdfService;
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        [HttpPost]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File không hợp lệ");

            try 
            {
                var fileExtension = Path.GetExtension(file.FileName).ToLower();
                var baseFileName = Guid.NewGuid().ToString();
                var fileName = $"{baseFileName}{fileExtension}";
                var filePath = Path.Combine(_uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"/uploads/{fileName}";
                string? pdfUrl = null;

                // T186: Auto convert docx to pdf
                if (fileExtension == ".docx")
                {
                    try
                    {
                        using (var docxStream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                        {
                            var text = await _docxService.ExtractTextAsync(docxStream);
                            var pdfBytes = await _pdfService.GeneratePdfFromTextAsync(text, $"Nội dung từ file: {file.FileName}");
                            
                            var pdfFileName = $"{baseFileName}.pdf";
                            var pdfFilePath = Path.Combine(_uploadPath, pdfFileName);
                            
                            await System.IO.File.WriteAllBytesAsync(pdfFilePath, pdfBytes);
                            pdfUrl = $"/uploads/{pdfFileName}";
                        }
                    }
                    catch (Exception)
                    {
                        // Log error but provide the original file url anyway
                    }
                }

                return Ok(new { 
                    FileUrl = fileUrl, 
                    PdfUrl = pdfUrl ?? fileUrl, // If converted, return pdfUrl, otherwise original
                    OriginalUrl = fileUrl,
                    FileName = file.FileName 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi upload: {ex.Message}");
            }
        }
    }
}
