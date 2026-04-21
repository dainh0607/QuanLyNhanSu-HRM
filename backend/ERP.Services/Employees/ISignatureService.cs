using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Employees.Profile;

namespace ERP.Services.Employees
{
    public interface ISignatureService
    {
        Task<IEnumerable<SignatureDto>> GetSignaturesByEmployeeIdAsync(int employeeId);
        Task<bool> CreateSignatureAsync(SignatureCreateDto dto);
        Task<bool> DeleteSignatureAsync(int id);
        Task<bool> SetDefaultSignatureAsync(int id, int employeeId);
    }
}
