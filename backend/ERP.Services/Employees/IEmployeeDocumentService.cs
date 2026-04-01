using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using ERP.DTOs.Employees;

namespace ERP.Services.Employees
{
    public interface IEmployeeDocumentService
    {
        /// <summary>
        /// Tải hồ sơ/tài liệu lên cho nhân viên (CV, CCCD, Bằng cấp)
        /// </summary>
        Task<EmployeeDocumentDto> UploadDocumentAsync(int employeeId, DocumentUploadDto dto, Stream fileStream, string fileName, string contentType);

        /// <summary>
        /// Lấy danh sách hồ sơ tài liệu của nhân viên
        /// </summary>
        Task<IEnumerable<EmployeeDocumentDto>> GetEmployeeDocumentsAsync(int employeeId);

        /// <summary>
        /// Xóa tài liệu
        /// </summary>
        Task<bool> DeleteDocumentAsync(int documentId);
    }
}
