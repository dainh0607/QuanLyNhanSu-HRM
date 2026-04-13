# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and csproj files for restore
COPY ["ERP.sln", "./"]
COPY ["ERP.API/ERP.API.csproj", "ERP.API/"]
COPY ["ERP.Services/ERP.Services.csproj", "ERP.Services/"]
COPY ["ERP.DTOs/ERP.DTOs.csproj", "ERP.DTOs/"]
COPY ["ERP.Repositories/ERP.Repositories.csproj", "ERP.Repositories/"]
COPY ["ERP.Entities/ERP.Entities.csproj", "ERP.Entities/"]

# Restore dependencies
RUN dotnet restore

# Copy the rest of the source code
COPY . .

# Build and publish
WORKDIR "/src/ERP.API"
RUN dotnet publish "ERP.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Environment variables
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ERP.API.dll"]
