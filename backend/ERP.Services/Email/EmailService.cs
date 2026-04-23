using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using ERP.DTOs.Common;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Logging;

namespace ERP.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task SendInvitationEmailAsync(string email, string fullName, string inviteLink)
        {
            var subject = "Lời mời gia nhập NexaHR Workspace";
            var body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px;'>
                    <h2 style='color: #134BBA;'>Chào {fullName},</h2>
                    <p>Bạn được mời gia nhập hệ thống quản trị nhân sự <b>NexaHR</b>.</p>
                    <p>Vui lòng click vào nút bên dưới để hoàn tất đăng ký tài khoản của bạn:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{inviteLink}' style='background-color: #134BBA; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Tham gia ngay</a>
                    </div>
                    <p style='font-size: 12px; color: #666;'>Nếu nút trên không hoạt động, bạn có thể copy link sau dán vào trình duyệt:</p>
                    <p style='font-size: 12px; color: #134BBA;'>{inviteLink}</p>
                    <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='font-size: 12px; color: #999;'>Đây là email tự động, vui lòng không phản hồi.</p>
                </div>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder { HtmlBody = body };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                // For Gmail, use StartTls if port is 587
                await client.ConnectAsync(_settings.SmtpServer, _settings.SmtpPort, _settings.UseSsl ? MailKit.Security.SecureSocketOptions.SslOnConnect : MailKit.Security.SecureSocketOptions.StartTls);

                if (!string.IsNullOrEmpty(_settings.Username))
                {
                    await client.AuthenticateAsync(_settings.Username, _settings.Password);
                }

                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                
                _logger.LogInformation("Email sent successfully to {Email}", to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email to {Email}", to);
                throw;
            }
        }
    }
}
