using System.Threading.Tasks;

namespace ERP.Services.Authorization
{
    /// <summary>
    /// Interface for managing SQL Row-Level Security (RLS) session context.
    /// maps to dbo.sp_SetRlsSessionContext procedure in the database.
    /// </summary>
    public interface IRlsSessionContextService
    {
        /// <summary>
        /// Sets the RLS session context for the current database connection.
        /// </summary>
        /// <param name="tenantId">ID of the current tenant</param>
        /// <param name="userId">ID of the currently authenticated user</param>
        /// <param name="employeeId">ID of the linked employee (if any)</param>
        /// <param name="scopeLevel">Hierarchy scope level (TENANT, REGION, BRANCH, DEPARTMENT, PERSONAL)</param>
        /// <param name="regionId">ID of assigned region (for REGION scope)</param>
        /// <param name="branchId">ID of assigned branch (for BRANCH scope)</param>
        /// <param name="departmentId">ID of assigned department (for DEPARTMENT scope)</param>
        /// <param name="isSystemAdmin">Flag indicating if user bypasses all filters</param>
        /// <param name="clientIp">Optional client IP for auditing</param>
        /// <returns>Task representing the asynchronous operation</returns>
        Task SetRlsContextAsync(
            int tenantId,
            int userId,
            int? employeeId = null,
            string scopeLevel = "PERSONAL",
            int? regionId = null,
            int? branchId = null,
            int? departmentId = null,
            bool isSystemAdmin = false,
            string clientIp = null);

        /// <summary>
        /// Clears the RLS session context for the current connection.
        /// Useful when returning connection to the pool (optional).
        /// </summary>
        Task ClearRlsContextAsync();
    }
}
