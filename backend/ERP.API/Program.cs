using Microsoft.EntityFrameworkCore;
using ERP.Entities;
using ERP.Entities.Models;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using ERP.Services.Auth;
using ERP.API.Auth;
using Microsoft.AspNetCore.Authentication;
using ERP.Repositories.Interfaces;
using ERP.Repositories.Implementations;
using ERP.Services.Employees;
using ERP.Services.Organization;
using ERP.Services.Lookup;
using ERP.Services.Contracts;
using ERP.Services.Common;
using ERP.DTOs.Common;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using System.Security.Claims;
using ERP.DTOs.Auth;
using ERP.API.Workers;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173", "http://127.0.0.1:4173" };

// Firebase SDK Initialization
var serviceAccountPath = Path.Combine(builder.Environment.ContentRootPath, "firebase-config.json");
if (File.Exists(serviceAccountPath))
{
    FirebaseApp.Create(new AppOptions()
    {
        Credential = GoogleCredential.FromFile(serviceAccountPath)
    });
}
else
{
    Console.WriteLine(" [WARNING] firebase-config.json not found. Firebase Admin SDK not initialized.");
}

// Authentication & Authorization Configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"] ?? "default_secret_key_at_least_32_characters_long")),
            ClockSkew = TimeSpan.Zero
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrWhiteSpace(context.Token) &&
                    context.Request.Cookies.TryGetValue(AuthSecurityConstants.AccessTokenCookieName, out var accessToken))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            },
            OnTokenValidated = async context =>
            {
                var principal = context.Principal;
                var tokenType = principal?.FindFirst(AuthSecurityConstants.TokenTypeClaimType)?.Value;
                var sessionId = principal?.FindFirst(AuthSecurityConstants.SessionIdClaimType)?.Value;
                var userIdValue = principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                // Handle Signer Token
                if (string.Equals(tokenType, AuthSecurityConstants.SignerTokenType, StringComparison.Ordinal))
                {
                    // Signer tokens don't have sessions or users in the DB
                    return;
                }

                // Handle Regular Access Token
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                if (!string.Equals(tokenType, AuthSecurityConstants.AccessTokenType, StringComparison.Ordinal) ||
                    string.IsNullOrWhiteSpace(sessionId) ||
                    !int.TryParse(userIdValue, out var userId))
                {
                    logger.LogWarning("[Auth] Invalid token structure.");
                    context.Fail("Access token khong hop le.");
                    return;
                }

                using var scope = context.HttpContext.RequestServices.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var authSession = await dbContext.AuthSessions.AsNoTracking()
                    .FirstOrDefaultAsync(session => session.session_id == sessionId && session.user_id == userId);

                if (authSession == null || !authSession.is_active || authSession.revoked_at.HasValue || authSession.expires_at <= DateTime.UtcNow)
                {
                    logger.LogWarning("[Auth] Session check failed for user {UserId}.", userId);
                    context.Fail("Session da het han hoac bi thu hoi.");
                }
            }
        };
    });

builder.Services.AddAuthorization();

// Add services to the container.
builder.Services.AddHttpClient();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
    });
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
builder.Services.AddSingleton(new AuthCsrfOptions
{
    AllowedOrigins = allowedOrigins
});

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IFirebaseService, FirebaseService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IClaimsTransformation, FirebaseClaimsTransformation>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IEmployeeProfileService, EmployeeProfileService>();
builder.Services.AddScoped<IOrganizationService, OrganizationService>();
builder.Services.AddScoped<ILookupService, LookupService>();
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<IContractService, ContractService>();
builder.Services.AddScoped<IContractTemplateService, ContractTemplateService>();
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<IEmployeeLifecycleService, EmployeeLifecycleService>();
builder.Services.AddScoped<IStorageService, LocalStorageService>();
builder.Services.AddScoped<IEmployeeDocumentService, EmployeeDocumentService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ISignerService, SignerService>();
builder.Services.AddScoped<IContractNotificationService, ContractNotificationService>();
builder.Services.AddHostedService<EmployeeStatusWorker>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Database initialization and seeding (Development only)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var db = services.GetRequiredService<AppDbContext>();

    try
    {
        if (app.Environment.IsDevelopment())
        {
            logger.LogInformation("[STARTUP] Ensuring database is migrated and seeded...");
            db.Database.Migrate();

            // Sync with Firebase
            var userService = services.GetRequiredService<IUserService>();
            await userService.SyncWithFirebaseAsync();

            // Seed User Elevation
            var testEmail = "kfrog1233@gmail.com";
            var user = db.Users.Include(u => u.Employee).FirstOrDefault(u => u.Employee.email == testEmail);
            if (user != null)
            {
                var managerRoleId = 2; // Manager
                var hasRole = db.UserRoles.Any(ur => ur.user_id == user.Id && (ur.role_id == 1 || ur.role_id == 2));
                if (!hasRole)
                {
                    db.UserRoles.Add(new ERP.Entities.Models.UserRoles { 
                        user_id = user.Id, 
                        role_id = managerRoleId, 
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                    db.SaveChanges();
                    logger.LogInformation("[SEED] Elevated {Email} to Manager role.", testEmail);
                }
            }

            // 2. Seed Contract Types
            if (!db.ContractTypes.Any())
            {
                db.ContractTypes.Add(new ERP.Entities.Models.ContractTypes {
                    name = "Hợp đồng thử việc"
                });
                db.SaveChanges();
                logger.LogInformation("[SEED] Default ContractType created.");
            }

            // 3. Seed Contract Templates
            if (!db.ContractTemplates.Any())
            {
                db.ContractTemplates.Add(new ERP.Entities.Models.ContractTemplates {
                    name = "Mẫu hợp đồng thử việc chuẩn",
                    content = @"<div style='text-align: center;'><h2>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2><h3>Độc lập - Tự do - Hạnh phúc</h3></div><br/><p>Chào ông/bà: <b>{{FullName}}</b> (Mã NV: <b>{{EmployeeCode}}</b>),</p><p>Chào mừng bạn gia nhập NexaHRM. Dưới đây là các điều khoản thử việc...</p><p>Ngày ký: {{SignDate}}</p><br/><br/><div style='display: flex; justify-content: space-between;'><div>Đại diện công ty</div><div>Người lao động</div></div>",
                    category = "Electronic", // Added required field
                    is_active = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
                db.SaveChanges();
                logger.LogInformation("[SEED] Default ContractTemplate created.");
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during startup initialization.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseMiddleware<CsrfProtectionMiddleware>();
app.UseAuthorization();

app.MapControllers();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
