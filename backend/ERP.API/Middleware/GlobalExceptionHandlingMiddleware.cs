using System.Diagnostics;
using ERP.Services.Auth;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace ERP.API.Middleware;

public sealed class GlobalExceptionHandlingMiddleware
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    public GlobalExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlingMiddleware> logger,
        IWebHostEnvironment environment,
        IConfiguration configuration)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            if (context.Response.HasStarted)
            {
                _logger.LogWarning(exception, "[ErrorMiddleware] Response already started for {Method} {Path}", context.Request.Method, context.Request.Path);
                throw;
            }

            await WriteErrorResponseAsync(context, exception);
        }
    }

    private async Task WriteErrorResponseAsync(HttpContext context, Exception exception)
    {
        var traceId = Activity.Current?.Id ?? context.TraceIdentifier;
        var (statusCode, errorCode, defaultMessage) = MapException(exception);
        var exposeExceptionDetails = _configuration.GetValue<bool?>("ErrorHandling:ExposeExceptionDetails") ?? _environment.IsDevelopment();
        var includeStackTrace = _configuration.GetValue<bool?>("ErrorHandling:IncludeStackTrace") ?? exposeExceptionDetails;
        var rootCause = GetInnermostException(exception);

        if (statusCode >= StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(
                exception,
                "[ErrorMiddleware] Unhandled exception for {Method} {Path}. TraceId={TraceId}",
                context.Request.Method,
                context.Request.Path,
                traceId);
        }
        else
        {
            _logger.LogWarning(
                exception,
                "[ErrorMiddleware] Request failed for {Method} {Path}. TraceId={TraceId}",
                context.Request.Method,
                context.Request.Path,
                traceId);
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json; charset=utf-8";

        var response = new ErrorResponse(
            Success: false,
            StatusCode: statusCode,
            Error: errorCode,
            Message: statusCode >= StatusCodes.Status500InternalServerError && !exposeExceptionDetails
                ? defaultMessage
                : rootCause.Message,
            TraceId: traceId,
            Path: context.Request.Path.Value ?? string.Empty,
            Method: context.Request.Method,
            TimestampUtc: DateTime.UtcNow,
            Details: exposeExceptionDetails ? BuildDetails(exception, includeStackTrace) : null);

        await context.Response.WriteAsJsonAsync(response, SerializerOptions);
    }

    private static (int StatusCode, string ErrorCode, string DefaultMessage) MapException(Exception exception)
    {
        return exception switch
        {
            AuthenticationSystemException => (StatusCodes.Status503ServiceUnavailable, "authentication_system_error", "He thong xac thuc dang tam thoi gian doan."),
            BadHttpRequestException => (StatusCodes.Status400BadRequest, "bad_request", "Yeu cau khong hop le."),
            ArgumentNullException => (StatusCodes.Status400BadRequest, "argument_null", "Du lieu bat buoc dang bi thieu."),
            ArgumentException => (StatusCodes.Status400BadRequest, "argument_error", "Tham so dau vao khong hop le."),
            FormatException => (StatusCodes.Status400BadRequest, "format_error", "Dinh dang du lieu khong hop le."),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "not_found", "Khong tim thay du lieu yeu cau."),
            FileNotFoundException => (StatusCodes.Status404NotFound, "file_not_found", "Khong tim thay tep du lieu."),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "forbidden", "Ban khong co quyen thuc hien thao tac nay."),
            DbUpdateConcurrencyException => (StatusCodes.Status409Conflict, "concurrency_conflict", "Du lieu da thay doi boi tien trinh khac."),
            InvalidOperationException => (StatusCodes.Status400BadRequest, "invalid_operation", "Thao tac hien tai khong hop le."),
            DbUpdateException => (StatusCodes.Status500InternalServerError, "database_error", "Da xay ra loi khi cap nhat co so du lieu."),
            NotImplementedException => (StatusCodes.Status501NotImplemented, "not_implemented", "Chuc nang nay chua duoc ho tro."),
            _ when exception.GetType() == typeof(Exception) => (StatusCodes.Status400BadRequest, "business_rule_error", "Yeu cau khong the duoc xu ly."),
            _ => (StatusCodes.Status500InternalServerError, "internal_server_error", "Da xay ra loi noi bo tren may chu.")
        };
    }

    private static ErrorDetails BuildDetails(Exception exception, bool includeStackTrace)
    {
        return new ErrorDetails(
            ExceptionType: exception.GetType().FullName ?? exception.GetType().Name,
            Message: exception.Message,
            RootCauseType: GetInnermostException(exception).GetType().FullName ?? GetInnermostException(exception).GetType().Name,
            RootCause: GetInnermostException(exception).Message,
            ExceptionChain: FlattenExceptionChain(exception),
            StackTrace: includeStackTrace ? exception.StackTrace : null);
    }

    private static Exception GetInnermostException(Exception exception)
    {
        var current = exception;
        while (current.InnerException is not null)
        {
            current = current.InnerException;
        }

        return current;
    }

    private static IReadOnlyList<ExceptionNode> FlattenExceptionChain(Exception exception)
    {
        var chain = new List<ExceptionNode>();
        var current = exception;

        while (current is not null)
        {
            chain.Add(new ExceptionNode(
                Type: current.GetType().FullName ?? current.GetType().Name,
                Message: current.Message));

            current = current.InnerException;
        }

        return chain;
    }
}

public static class GlobalExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<GlobalExceptionHandlingMiddleware>();
    }
}

public sealed record ErrorResponse(
    bool Success,
    int StatusCode,
    string Error,
    string Message,
    string TraceId,
    string Path,
    string Method,
    DateTime TimestampUtc,
    ErrorDetails? Details);

public sealed record ErrorDetails(
    string ExceptionType,
    string Message,
    string RootCauseType,
    string RootCause,
    IReadOnlyList<ExceptionNode> ExceptionChain,
    string? StackTrace);

public sealed record ExceptionNode(
    string Type,
    string Message);
