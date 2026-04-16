using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERP.Services.Attendance
{
    public interface IShiftNotificationService
    {
        /// <summary>
        /// Thông báo cho nhân viên khi ca làm việc được công bố.
        /// </summary>
        Task NotifyShiftPublishedAsync(List<int> assignmentIds);

        /// <summary>
        /// Thông báo cho nhân viên khi ca làm việc được chấp thuận/chính thức.
        /// </summary>
        Task NotifyShiftApprovedAsync(List<int> assignmentIds);
    }
}
