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

                if (!string.Equals(tokenType, AuthSecurityConstants.AccessTokenType, StringComparison.Ordinal) ||
                    string.IsNullOrWhiteSpace(sessionId) ||
                    !int.TryParse(userIdValue, out var userId))
                {
                    context.Fail("Access token khong hop le.");
                    return;
                }

                using var scope = context.HttpContext.RequestServices.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var authSession = await dbContext.AuthSessions.AsNoTracking()
                    .FirstOrDefaultAsync(session => session.session_id == sessionId && session.user_id == userId);

                if (authSession == null || !authSession.is_active || authSession.revoked_at.HasValue || authSession.expires_at <= DateTime.UtcNow)
                {
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
builder.Services.AddScoped<IContractService, ContractService>();
builder.Services.AddScoped<IEmployeeLifecycleService, EmployeeLifecycleService>();
builder.Services.AddScoped<IStorageService, LocalStorageService>();
builder.Services.AddScoped<IEmployeeDocumentService, EmployeeDocumentService>();
builder.Services.AddHostedService<EmployeeStatusWorker>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();
// Automatic Database Migration and Firebase User Sync for Development
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        var userService = services.GetRequiredService<IUserService>();
        var logger = services.GetRequiredService<ILogger<Program>>();

        if (app.Environment.IsDevelopment())
        {
            logger.LogInformation("Development mode: Ensuring database is migrated and synced...");
            context.Database.Migrate();
            await userService.SyncWithFirebaseAsync();
            logger.LogInformation("Database initialization and sync complete.");
        }

    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or syncing the database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
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
