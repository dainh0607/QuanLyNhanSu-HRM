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
using ERP.Services.Attendance;
using ERP.Services.Common;
using ERP.Services.Authorization;
using ERP.Services.Payroll;
using ERP.Services;
using ERP.Services.Email;
using ERP.API.Middleware;
using ERP.API.Extensions;
using ERP.DTOs.Common;
using ERP.Services.ControlPlane;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Unicode;
using System.Security.Claims;
using ERP.DTOs.Auth;
using ERP.API.Workers;
using ERP.API.DataTest;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173", "http://127.0.0.1:4173" };

// Firebase SDK Initialization
var serviceAccountPath = Path.Combine(builder.Environment.ContentRootPath, "firebase-config.json");
if (File.Exists(serviceAccountPath) && new FileInfo(serviceAccountPath).Length > 0)
{
    try
    {
        FirebaseApp.Create(new AppOptions()
        {
            Credential = GoogleCredential.FromFile(serviceAccountPath)
        });
    }
    catch (Exception ex)
    {
        Console.WriteLine($" [ERROR] Failed to initialize Firebase: {ex.Message}");
    }
}
else
{
    Console.WriteLine(" [WARNING] firebase-config.json not found or is empty. Firebase Admin SDK not initialized.");
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

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthSecurityConstants.SuperAdminPolicyName, policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireRole(AuthSecurityConstants.RoleSuperAdmin);
    });
});

// Add services to the container.
builder.Services.AddHttpClient();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
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
builder.Services.AddHttpContextAccessor();

// RBAC Authorization Services
builder.Services.AddScoped<ERP.Entities.Interfaces.ICurrentUserContext, CurrentUserContext>();
builder.Services.AddScoped<ERP.Services.Authorization.IAuthorizationService, ERP.Services.Authorization.AuthorizationService>();
builder.Services.AddScoped<ERP.Services.Authorization.IAuthorizationManagementService, ERP.Services.Authorization.AuthorizationManagementService>();
builder.Services.AddScoped<ERP.Services.Authorization.IBreakGlassService, ERP.Services.Authorization.BreakGlassService>();
builder.Services.AddScoped<ERP.Services.Authorization.IPermissionAuditLogService, ERP.Services.Authorization.PermissionAuditLogService>();
builder.Services.AddScoped<ERP.Services.Authorization.ILoginAttemptService, ERP.Services.Authorization.LoginAttemptService>();
builder.Services.AddScoped<ERP.Services.Authorization.IScopedQueryHelper, ERP.Services.Authorization.ScopedQueryHelper>();

builder.Services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, ERP.API.Authorization.PermissionHandler>();
builder.Services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationPolicyProvider, ERP.API.Authorization.PermissionPolicyProvider>();

builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IEmployeeProfileService, EmployeeProfileService>();
builder.Services.AddScoped<ISalaryConfigurationService, SalaryConfigurationService>();
builder.Services.AddScoped<IInsuranceService, InsuranceService>();
builder.Services.AddScoped<ISignatureService, SignatureService>();
builder.Services.AddScoped<IMobilePermissionService, MobilePermissionService>();
builder.Services.AddScoped<IPayrollService, PayrollService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IOrganizationService, OrganizationService>();
builder.Services.AddScoped<ILookupService, LookupService>();
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<IContractService, ContractService>();
builder.Services.AddScoped<IContractTemplateService, ContractTemplateService>();
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<IEmployeeLifecycleService, EmployeeLifecycleService>();
builder.Services.AddScoped<IStorageService, LocalStorageService>();
builder.Services.AddScoped<IEmployeeDocumentService, EmployeeDocumentService>();
builder.Services.AddScoped<ERP.Services.Common.IEmailService, ERP.Services.Common.EmailService>();
builder.Services.AddScoped<ERP.Services.Email.IEmailService, ERP.Services.Email.EmailService>();
builder.Services.AddScoped<ISignerService, SignerService>();
builder.Services.AddScoped<IContractNotificationService, ContractNotificationService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<ILeaveRequestService, LeaveRequestService>();
builder.Services.AddScoped<IShiftService, ShiftService>();
builder.Services.AddScoped<IShiftTemplateService, ShiftTemplateService>();
builder.Services.AddScoped<IShiftAssignmentService, ShiftAssignmentService>();
builder.Services.AddScoped<IShiftNotificationService, ShiftNotificationService>();
builder.Services.AddScoped<IDocxService, DocxService>();
builder.Services.AddScoped<IRlsSessionContextService, RlsSessionContextService>();
builder.Services.AddScoped<IEmploymentHistoryService, EmploymentHistoryService>();
builder.Services.AddHostedService<EmployeeStatusWorker>();
builder.Services.AddHostedService<AttendanceAutomationWorker>();
builder.Services.AddHostedService<TenantMetadataSyncWorker>();
builder.Services.AddHostedService<BillingAutomationWorker>();

// FIX #1-15: Register RBAC Authorization Services
builder.Services.AddScoped<ISuperAdminPortalService, SuperAdminPortalService>();
builder.Services.AddScoped<IAuthorizationManagementService, AuthorizationManagementService>();
builder.Services.AddScoped<IAuthorizationService, AuthorizationService>();
builder.Services.AddScoped<IPermissionAuditLogService, PermissionAuditLogService>();
builder.Services.AddScoped<IBreakGlassService, BreakGlassService>();
builder.Services.AddScoped<ILoginAttemptService, LoginAttemptService>();

// Audit Log & Workspace Activation
builder.Services.AddScoped<ERP.Services.AuditLog.IAuditLogService, ERP.Services.AuditLog.AuditLogService>();
builder.Services.AddScoped<ERP.Services.ControlPlane.IWorkspaceActivationService, ERP.Services.ControlPlane.WorkspaceActivationService>();

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
        // 0. CLI Handling for Super Admin Seed
        if (args.Contains("--seed-superadmin"))
        {
            var email = args.SkipWhile(a => a != "--email").Skip(1).FirstOrDefault();
            var password = args.SkipWhile(a => a != "--password").Skip(1).FirstOrDefault();

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                Console.WriteLine("\n [ERROR] Missing arguments.");
                Console.WriteLine(" Usage: dotnet run -- --seed-superadmin --email <email> --password <password>");
                Console.WriteLine(" Note: In dotnet run, use '--' before custom arguments.\n");
                return;
            }

            Console.WriteLine($"\n [CLI] Initializing Super Admin: {email}...");
            db.Database.Migrate(); // Ensure DB is ready

            var authService = services.GetRequiredService<IAuthService>();
            var result = await authService.InitializeSuperAdminInternalAsync(email, password);

            if (result.Success)
            {
                Console.WriteLine($" [SUCCESS] {result.Message}\n");
            }
            else
            {
                Console.WriteLine($" [FAILED] {result.Message}\n");
            }
            return;
        }

        if (app.Environment.IsDevelopment())
        {
            logger.LogInformation("[STARTUP] Ensuring database is migrated and seeded...");
            db.Database.Migrate();
            await AuthSessionSchemaInitializer.EnsureCreatedAsync(db);
            await RlsSchemaInitializer.EnsureUpdatedAsync(db, app.Environment.ContentRootPath, logger);

            // 1. Apply Sample Data from SQL file
            await DataSeeder.ApplySampleDataAsync(app.Services);

            // Sync with Firebase (DISABLED: Manual sync only to avoid tenant leakage)
            // var userService = services.GetRequiredService<IUserService>();
            // await userService.SyncWithFirebaseAsync();

            // Seed User Elevation
            var testEmails = new[] { "kfrog1233@gmail.com", "dainh123@gmail.com" };
            foreach (var email in testEmails)
            {
                var user = db.Users.Include(u => u.Employee).FirstOrDefault(u => u.Employee.email == email);
                if (user != null)
                {
                    var isDainh = email == "dainh123@gmail.com";
                    var targetRoleId = isDainh ? 1 : 2; // Admin for dainh, Manager for kfrog
                    var targetRoleName = isDainh ? "Admin" : "Manager";

                    var hasRole = db.UserRoles.Any(ur => ur.user_id == user.Id && (ur.role_id == 1 || ur.role_id == 2));
                    if (!hasRole)
                    {
                        db.UserRoles.Add(new ERP.Entities.Models.UserRoles
                        {
                            user_id = user.Id,
                            role_id = targetRoleId,
                            is_active = true,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                        db.SaveChanges();
                        logger.LogInformation("[SEED] Elevated {Email} to {Role} role.", email, targetRoleName);
                    }
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

        try
        {
            await AuthSessionSchemaInitializer.EnsureCreatedAsync(db);
            logger.LogWarning("[STARTUP] Applied fallback AuthSessions schema initialization after startup failure.");
        }
        catch (Exception schemaEx)
        {
            logger.LogError(schemaEx, "Fallback AuthSessions schema initialization failed.");
        }
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

app.UseLoginErrorLogging();
app.UseGlobalExceptionHandling();
app.UseSubdomainResolution();
app.UseAuthentication();
app.UseRlsSessionContext();
app.UseMiddleware<CsrfProtectionMiddleware>();
app.UseMiddleware<ERP.API.Middleware.BreakGlassMiddleware>();
app.UseMiddleware<AuthorizationMiddleware>(); // FIX #1-15: RBAC Authorization middleware
app.UseAuthorization();
app.UseMiddleware<AuditLoggingMiddleware>();

app.MapControllers();


app.Run();
