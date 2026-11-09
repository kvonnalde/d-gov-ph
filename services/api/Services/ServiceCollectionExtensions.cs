using DgovPh.Api.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace DgovPh.Api.Services;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDgovPhServices(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var connectionString = configuration.GetConnectionString("AppDb")
            ?? throw new InvalidOperationException("ConnectionStrings:AppDb is required.");

        if (!environment.IsDevelopment())
        {
            var settings = new SqlConnectionStringBuilder(connectionString);
            if (string.IsNullOrWhiteSpace(settings.DataSource)
                || string.IsNullOrWhiteSpace(settings.InitialCatalog)
                || settings.Authentication != SqlAuthenticationMethod.ActiveDirectoryManagedIdentity
                || !string.IsNullOrEmpty(settings.Password))
            {
                throw new InvalidOperationException(
                    "Production SQL connections require a database, managed identity authentication, and no password.");
            }

            settings.Encrypt = SqlConnectionEncryptOption.Mandatory;
            settings.TrustServerCertificate = false;
            connectionString = settings.ConnectionString;
        }

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure()));
        services.AddHttpClient<DataGovPhCatalogClient>(client =>
        {
            client.BaseAddress = new Uri("https://api.data.gov.ph/");
            client.Timeout = TimeSpan.FromSeconds(15);
        });
        services.AddScoped<ITransparencyService, TransparencyService>();
        services.AddScoped<IDatabaseHealthService, DatabaseHealthService>();
        return services;
    }
}
