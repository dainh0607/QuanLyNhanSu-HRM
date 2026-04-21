using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using ERP.DTOs.Common;

namespace ERP.Services.Common
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly EmailSettings _emailSettings;

        public EmailService(ILogger<EmailService> logger, IOptions<EmailSettings> emailSettings)
        {
            _logger = logger;
            _emailSettings = emailSettings.Value;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            _logger.LogInformation("[Email] Sending email to {0}...", toEmail);

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = body };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            client.Timeout = 10000; // 10 seconds timeout
            
            // Helpful for debugging connection issues
            // client.ServerCertificateValidationCallback = (s, c, h, e) => true;

            try
            {
                // Port 587 typically uses StartTls. Port 465 uses SslOnConnect.
                var options = _emailSettings.UseSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
                
                await client.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort, options);

                if (!string.IsNullOrEmpty(_emailSettings.Username))
                {
                    await client.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
                }

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("[Email] Sent successfully to {0}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Email] FAILED to send email to {0}", toEmail);
                throw; // Re-throw to inform the caller (and the API)
            }
        }
    }
}
