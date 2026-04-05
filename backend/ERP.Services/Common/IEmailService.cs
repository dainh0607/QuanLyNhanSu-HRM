using System.Threading.Tasks;

namespace ERP.Services.Common
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }
}
