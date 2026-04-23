using System.Text;
using ERP.API.Middleware;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;

namespace ERP.Tests.API;

public class LoginErrorLoggingMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_LoginFailure_PreservesResponseBodyAndAddsTraceHeader()
    {
        var expectedJson = "{\"success\":false,\"message\":\"Sai tai khoan hoac mat khau\"}";
        var context = CreateContext("/api/auth/login", HttpMethods.Post, "{\"email\":\"admin@example.com\",\"password\":\"secret123\"}");
        var middleware = new LoginErrorLoggingMiddleware(async innerContext =>
        {
            innerContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await innerContext.Response.WriteAsync(expectedJson);
        }, Mock.Of<ILogger<LoginErrorLoggingMiddleware>>());

        await middleware.InvokeAsync(context);

        Assert.Equal(StatusCodes.Status401Unauthorized, context.Response.StatusCode);
        Assert.True(context.Response.Headers.ContainsKey("X-Trace-Id"));

        context.Response.Body.Position = 0;
        using var reader = new StreamReader(context.Response.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, leaveOpen: true);
        var actualJson = await reader.ReadToEndAsync();
        Assert.Equal(expectedJson, actualJson);
    }

    [Fact]
    public async Task InvokeAsync_NonLoginRequest_DoesNotAddTraceHeader()
    {
        var context = CreateContext("/api/auth/refresh", HttpMethods.Post, "{}");
        var middleware = new LoginErrorLoggingMiddleware(async innerContext =>
        {
            innerContext.Response.StatusCode = StatusCodes.Status200OK;
            await innerContext.Response.WriteAsync("{\"success\":true}");
        }, Mock.Of<ILogger<LoginErrorLoggingMiddleware>>());

        await middleware.InvokeAsync(context);

        Assert.False(context.Response.Headers.ContainsKey("X-Trace-Id"));
    }

    private static DefaultHttpContext CreateContext(string path, string method, string body)
    {
        var context = new DefaultHttpContext();
        context.Request.Path = path;
        context.Request.Method = method;
        context.Request.ContentType = "application/json";
        context.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes(body));
        context.Response.Body = new MemoryStream();
        return context;
    }
}
