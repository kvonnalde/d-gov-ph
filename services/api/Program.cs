using System.Text.Json.Serialization;
using DgovPh.Api.Contracts;
using DgovPh.Api.Endpoints;
using DgovPh.Api.Errors;
using DgovPh.Api.Services;
using Microsoft.AspNetCore.HttpLogging;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddHttpLogging(options =>
{
    options.LoggingFields = HttpLoggingFields.RequestMethod
        | HttpLoggingFields.RequestPath
        | HttpLoggingFields.ResponseStatusCode
        | HttpLoggingFields.Duration;
});
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter<ApiErrorCode>()));
builder.Services.AddDgovPhServices(builder.Configuration, builder.Environment);

var app = builder.Build();

app.UseExceptionHandler();
app.UseHttpLogging();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi("/api/openapi/{documentName}.json");
}

app.MapHealthEndpoints();
app.MapDashboardEndpoints();
app.MapBudgetRecordEndpoints();
app.MapAgencyEndpoints();
app.MapSourceEndpoints();
app.MapDataGovPhCatalogEndpoints();

app.Run();
