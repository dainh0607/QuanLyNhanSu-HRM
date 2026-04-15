using ERP.Entities;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Data;

namespace ERP.Services.Authorization
{
    public class RlsSessionContextService : IRlsSessionContextService
    {
        private readonly AppDbContext _context;

        public RlsSessionContextService(AppDbContext context)
        {
            _context = context;
        }

        public async Task SetRlsContextAsync(
            int tenantId,
            int userId,
            int? employeeId = null,
            string scopeLevel = "PERSONAL",
            int? regionId = null,
            int? branchId = null,
            int? departmentId = null,
            bool isSystemAdmin = false,
            string clientIp = null)
        {
            // Prepare parameters for the stored procedure
            var parameters = new[]
            {
                new SqlParameter("@TenantId", tenantId),
                new SqlParameter("@UserId", userId),
                new SqlParameter("@EmployeeId", employeeId ?? (object)System.DBNull.Value),
                new SqlParameter("@ScopeLevel", scopeLevel ?? "PERSONAL"),
                new SqlParameter("@RegionId", regionId ?? (object)System.DBNull.Value),
                new SqlParameter("@BranchId", branchId ?? (object)System.DBNull.Value),
                new SqlParameter("@DepartmentId", departmentId ?? (object)System.DBNull.Value),
                new SqlParameter("@IsSystemAdmin", isSystemAdmin),
                new SqlParameter("@ClientIP", clientIp ?? (object)System.DBNull.Value)
            };

            // Execute the stored procedure
            // Using ExecuteSqlRawAsync to call sp_SetRlsSessionContext
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC dbo.sp_SetRlsSessionContext @TenantId, @UserId, @EmployeeId, @ScopeLevel, @RegionId, @BranchId, @DepartmentId, @IsSystemAdmin, @ClientIP",
                parameters);
        }

        public async Task ClearRlsContextAsync()
        {
            await _context.Database.ExecuteSqlRawAsync("EXEC dbo.sp_ClearRlsSessionContext");
        }
    }
}
