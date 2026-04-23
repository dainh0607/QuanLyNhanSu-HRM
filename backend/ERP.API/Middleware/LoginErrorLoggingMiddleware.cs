using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace ERP.API.Middleware;

public sealed class LoginErrorLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LoginErrorLoggingMiddleware> _logger;

    public LoginErrorLoggingMiddleware(
        RequestDelegate next,
        ILogger<LoginErrorLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!IsLoginRequest(context.Request))
        {
            await _next(context);
            return;
        }

        var traceId = Activity.Current?.Id ?? context.TraceIdentifier;
        context.Response.Headers["X-Trace-Id"] = traceId;

        var email = await TryReadEmailAsync(context.Request);
        var originalBody = context.Response.Body;
        await using var responseBuffer = new MemoryStream();
        context.Response.Body = responseBuffer;

        try
        {
            await _next(context);
            await LogLoginResultAsync(context, email, traceId, responseBuffer);
        }
        finally
        {
            responseBuffer.Position = 0;
            await responseBuffer.CopyToAsync(originalBody);
            context.Response.Body = originalBody;
        }
    }

    private async Task LogLoginResultAsync(HttpContext context, string? email, string traceId, MemoryStream responseBuffer)
    {
        responseBuffer.Position = 0;
        using var reader = new StreamReader(responseBuffer, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, leaveOpen: true);
        var responseBody = await reader.ReadToEndAsync();
        responseBuffer.Position = 0;

        var statusCode = context.Response.StatusCode;
        var detail = ExtractErrorDetail(responseBody);

        if (statusCode >= StatusCodes.Status400BadRequest)
        {
            _logger.LogWarning(
                "[LoginError] Login failed. TraceId={TraceId}, StatusCode={StatusCode}, Email={Email}, Path={Path}, Detail={Detail}",
                traceId,
                statusCode,
                string.IsNullOrWhiteSpace(email) ? "(unknown)" : email,
                context.Request.Path,
                string.IsNullOrWhiteSpace(detail) ? "(empty response)" : detail);

            return;
        }

        _logger.LogInformation(
            "[LoginSuccess] Login succeeded. TraceId={TraceId}, StatusCode={StatusCode}, Email={Email}, Path={Path}",
            traceId,
            statusCode,
            string.IsNullOrWhiteSpace(email) ? "(unknown)" : email,
            context.Request.Path);
    }

    private static bool IsLoginRequest(HttpRequest request)
    {
        return HttpMethods.IsPost(request.Method)
            && request.Path.Equals("/api/auth/login", StringComparison.OrdinalIgnoreCase);
    }

    private static async Task<string?> TryReadEmailAsync(HttpRequest request)
    {
        if (!request.HasJsonContentType())
        {
            return null;
        }

        request.EnableBuffering();
        request.Body.Position = 0;

        using var reader = new StreamReader(request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, leaveOpen: true);
        var body = await reader.ReadToEndAsync();
        request.Body.Position = 0;

        if (string.IsNullOrWhiteSpace(body))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(body);
            if (document.RootElement.ValueKind != JsonValueKind.Object)
            {
                return null;
            }

            if (document.RootElement.TryGetProperty("email", out var emailElement))
            {
                return emailElement.GetString()?.Trim();
            }
        }
        catch (JsonException)
        {
            return null;
        }

        return null;
    }

    private static string? ExtractErrorDetail(string responseBody)
    {
        if (string.IsNullOrWhiteSpace(responseBody))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(responseBody);
            var root = document.RootElement;

            if (TryGetString(root, "message", out var message))
            {
                return message;
            }

            if (TryGetString(root, "Message", out message))
            {
                return message;
            }

            if (TryGetString(root, "error", out var error))
            {
                return error;
            }

            if (TryGetString(root, "title", out var title))
            {
                return title;
            }

            if (root.TryGetProperty("errors", out var errors))
            {
                return errors.ToString();
            }

            return root.ToString();
        }
        catch (JsonException)
        {
            return responseBody;
        }
    }

    private static bool TryGetString(JsonElement element, string propertyName, out string? value)
    {
        value = null;
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return false;
        }

        if (property.ValueKind == JsonValueKind.String)
        {
            value = property.GetString();
            return !string.IsNullOrWhiteSpace(value);
        }

        value = property.ToString();
        return !string.IsNullOrWhiteSpace(value);
    }
}

public static class LoginErrorLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseLoginErrorLogging(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<LoginErrorLoggingMiddleware>();
    }
}
