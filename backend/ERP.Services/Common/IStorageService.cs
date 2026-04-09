using System.IO;
using System.Threading.Tasks;

namespace ERP.Services.Common
{
    public interface IStorageService
    {
        /// <summary>
        /// Tải file lên bộ lưu trữ
        /// </summary>
        /// <param name="fileStream">Luồng dữ liệu file</param>
        /// <param name="fileName">Tên file (bao gồm cả đường dẫn/folder nếu cần)</param>
        /// <param name="contentType">Loại nội dung file</param>
        /// <returns>URL truy cập file công khai hoặc có ký nhận</returns>
        Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);

        /// <summary>
        /// Lưu file từ byte array và trả về URL
        /// </summary>
        Task<string> SaveFileAsync(byte[] fileBytes, string fileName, string contentType);

        /// <summary>
        /// Xóa file khỏi bộ lưu trữ
        /// </summary>
        /// <param name="fileUrl">URL của file cần xóa</param>
        Task<bool> DeleteFileAsync(string fileUrl);

        /// <summary>
        /// Tải file từ bộ lưu trữ
        /// </summary>
        /// <param name="filePath">Đường dẫn/URL của file</param>
        /// <returns>Nội dung file dưới dạng byte array</returns>
        Task<byte[]> GetFileAsync(string filePath);
    }
}
