using System.Text.Json;
using ERP.API.Middleware;
using ERP.Services.Auth;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;

namespace ERP.Tests.API;

public class ExceptionHandlingMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_InDevelopment_ReturnsDetailedErrorPayload()
    {
        var context = CreateHttpContext("/api/test/errors", HttpMethods.Post);
        var middleware = CreateMiddleware(
            next: _ => throw new InvalidOperationException("Khong the cap nhat du lieu."),
            environmentName: Environments.Development);

        await middleware.InvokeAsync(context);

        Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);

        var json = await ReadResponseJsonAsync(context);
        Assert.False(json.RootElement.GetProperty("success").GetBoolean());
        Assert.Equal("invalid_operation", json.RootElement.GetProperty("error").GetString());
        Assert.Equal("Khong the cap nhat du lieu.", json.RootElement.GetProperty("message").GetString());
        Assert.True(json.RootElement.TryGetProperty("details", out var details));
        Assert.Equal(typeof(InvalidOperationException).FullName, details.GetProperty("exceptionType").GetString());
        Assert.True(details.TryGetProperty("stackTrace", out _));
    }

    [Fact]
    public async Task InvokeAsync_InProductionWithDetailsDisabled_HidesInternalDetails()
    {
        var context = CreateHttpContext("/api/test/errors", HttpMethods.Get);
        var middleware = CreateMiddleware(
            next: _ => throw new NullReferenceException("Boom"),
            environmentName: Environments.Production,
            configurationValues: new Dictionary<string, string?>
            {
                ["ErrorHandling:ExposeExceptionDetails"] = "false",
                ["ErrorHandling:IncludeStackTrace"] = "false"
            });

        await middleware.InvokeAsync(context);

        Assert.Equal(StatusCodes.Status500InternalServerError, context.Response.StatusCode);

        var json = await ReadResponseJsonAsync(context);
        Assert.Equal("internal_server_error", json.RootElement.GetProperty("error").GetString());
        Assert.Equal("Da xay ra loi noi bo tren may chu.", json.RootElement.GetProperty("message").GetString());
        Assert.False(json.RootElement.TryGetProperty("details", out _));
    }

    [Fact]
    public async Task InvokeAsync_WhenAuthenticationSystemException_ReturnsServiceUnavailablePayload()
    {
        var context = CreateHttpContext("/api/auth/login", HttpMethods.Post);
        var middleware = CreateMiddleware(
            next: _ => throw new AuthenticationSystemException("Firebase authentication service is unavailable."),
            environmentName: Environments.Development);

        await middleware.InvokeAsync(context);

        Assert.Equal(StatusCodes.Status503ServiceUnavailable, context.Response.StatusCode);

        var json = await ReadResponseJsonAsync(context);
        Assert.Equal("authentication_system_error", json.RootElement.GetProperty("error").GetString());
        Assert.Equal("Firebase authentication service is unavailable.", json.RootElement.GetProperty("message").GetString());
    }

    private static DefaultHttpContext CreateHttpContext(string path, string method)
    {
        var context = new DefaultHttpContext();
        context.Request.Path = path;
        context.Request.Method = method;
        context.Response.Body = new MemoryStream();
        return context;
    }

    private static GlobalExceptionHandlingMiddleware CreateMiddleware(
        RequestDelegate next,
        string environmentName,
        IDictionary<string, string?>? configurationValues = null)
    {
        var environment = new Mock<IWebHostEnvironment>();
        environment.SetupGet(x => x.EnvironmentName).Returns(environmentName);

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configurationValues ?? new Dictionary<string, string?>())
            .Build();

        return new GlobalExceptionHandlingMiddleware(
            next,
            Mock.Of<ILogger<GlobalExceptionHandlingMiddleware>>(),
            environment.Object,
            configuration);
    }

    private static async Task<JsonDocument> ReadResponseJsonAsync(DefaultHttpContext context)
    {
        context.Response.Body.Position = 0;
        return await JsonDocument.ParseAsync(context.Response.Body);
    }
}
