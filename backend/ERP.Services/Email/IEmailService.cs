using System.Threading.Tasks;

namespace ERP.Services.Email
{
    public interface IEmailService
    {
        Task SendInvitationEmailAsync(string email, string fullName, string inviteLink);
        Task SendEmailAsync(string to, string subject, string body);
    }
}
