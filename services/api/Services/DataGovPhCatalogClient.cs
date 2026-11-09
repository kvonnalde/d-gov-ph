using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using DgovPh.Api.Contracts;

namespace DgovPh.Api.Services;

public sealed record DataGovPhResourceFileDownload(byte[] Content, string ContentType, string FileName);

public sealed class DataGovPhResourceFileUnavailableException(string message) : Exception(message);

public sealed class DataGovPhCatalogUnavailableException(string message, Exception? innerException = null)
    : Exception(message, innerException);

public sealed class DataGovPhCatalogClient(HttpClient httpClient, IConfiguration configuration)
{
    private const string PublicPortalClientId = "odphapiproduction";
    private const string PublicPortalKeyPhrase = "DqqG8Wi9xamPx1j5ho6Wmig9apdMWRDXe6cdfa76SPkgS9MKJH10H5Vt9N04";

    public async Task<DataGovPhDatasetSearchResponse> SearchAsync(
        string query,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var apiKey = configuration["DataGovPh:ApiKey"];

        using var request = new HttpRequestMessage(HttpMethod.Post, "api/public/dataset/search")
        {
            Content = JsonContent.Create(new
            {
                global = query,
                topics = Array.Empty<string>(),
                agency = Array.Empty<string>(),
                resourceFormat = Array.Empty<string>(),
                page,
                limit = pageSize,
                sort = new { dateModified = -1 }
            })
        };
        request.Headers.Add("X-API-KEY", string.IsNullOrWhiteSpace(apiKey) ? CreatePublicClientHeader() : apiKey);

        try
        {
            using var response = await httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                throw new DataGovPhCatalogUnavailableException(
                    $"The Open Data Philippines API returned HTTP {(int)response.StatusCode}.");
            }

            var result = await response.Content.ReadFromJsonAsync<UpstreamSearchResponse>(cancellationToken);
            if (result is not { Success: true })
            {
                throw new DataGovPhCatalogUnavailableException("The Open Data Philippines API returned an unsuccessful response.");
            }

            var items = (result.Data ?? []).Select(dataset => new DataGovPhDatasetResponse(
                dataset.Id,
                dataset.Name,
                dataset.Publisher,
                dataset.Description,
                dataset.License,
                dataset.ModifiedDate,
                dataset.Url,
                dataset.Topics ?? [],
                (dataset.Resources ?? []).Select(resource => new DataGovPhResourceResponse(
                    resource.Id,
                    resource.Name,
                    resource.Format,
                    (resource.Files ?? []).Select(file => new DataGovPhResourceFileResponse(
                        file.Id,
                        file.Name,
                        file.Size)).ToArray())).ToArray())).ToArray();

            return new DataGovPhDatasetSearchResponse(result.Total, result.Page, pageSize, items);
        }
        catch (HttpRequestException exception)
        {
            throw new DataGovPhCatalogUnavailableException("The Open Data Philippines API could not be reached.", exception);
        }
        catch (OperationCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            throw new DataGovPhCatalogUnavailableException("The Open Data Philippines API request timed out.", exception);
        }
        catch (JsonException exception)
        {
            throw new DataGovPhCatalogUnavailableException("The Open Data Philippines API returned invalid data.", exception);
        }
    }

    public async Task<DataGovPhResourceFileDownload> DownloadResourceFileAsync(
        string fileId,
        CancellationToken cancellationToken)
    {
        var apiKey = configuration["DataGovPh:ApiKey"];
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"api/file/download?_id={Uri.EscapeDataString(fileId)}");
        request.Headers.Add("X-API-KEY", string.IsNullOrWhiteSpace(apiKey) ? CreatePublicClientHeader() : apiKey);

        try
        {
            using var response = await httpClient.SendAsync(request, cancellationToken);
            if (response.StatusCode is HttpStatusCode.BadRequest or HttpStatusCode.NotFound)
            {
                throw new DataGovPhResourceFileUnavailableException(
                    "This file is listed in the catalog but is no longer available from the publishing agency.");
            }

            if (!response.IsSuccessStatusCode)
            {
                throw new DataGovPhCatalogUnavailableException(
                    $"The Open Data Philippines file service returned HTTP {(int)response.StatusCode}.");
            }

            var content = await response.Content.ReadAsByteArrayAsync(cancellationToken);
            var upstreamName = response.Content.Headers.ContentDisposition?.FileNameStar
                ?? response.Content.Headers.ContentDisposition?.FileName;
            var fileName = string.IsNullOrWhiteSpace(upstreamName)
                ? "government-dataset-download"
                : Path.GetFileName(upstreamName.Trim('"'));

            return new DataGovPhResourceFileDownload(
                content,
                response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream",
                fileName);
        }
        catch (HttpRequestException exception)
        {
            throw new DataGovPhCatalogUnavailableException("The Open Data Philippines file service could not be reached.", exception);
        }
        catch (OperationCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            throw new DataGovPhCatalogUnavailableException("The Open Data Philippines file request timed out.", exception);
        }
    }

    private static string CreatePublicClientHeader()
    {
        var salt = RandomNumberGenerator.GetBytes(8);
        var password = Encoding.UTF8.GetBytes(PublicPortalKeyPhrase);
        var derivedBytes = new byte[48];
        var previousBlock = Array.Empty<byte>();
        var derivedOffset = 0;

        while (derivedOffset < derivedBytes.Length)
        {
            var input = new byte[previousBlock.Length + password.Length + salt.Length];
            previousBlock.CopyTo(input, 0);
            password.CopyTo(input, previousBlock.Length);
            salt.CopyTo(input, previousBlock.Length + password.Length);
            previousBlock = MD5.HashData(input);
            var copyLength = Math.Min(previousBlock.Length, derivedBytes.Length - derivedOffset);
            previousBlock.AsSpan(0, copyLength).CopyTo(derivedBytes.AsSpan(derivedOffset));
            derivedOffset += copyLength;
        }

        using var aes = Aes.Create();
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;
        aes.Key = derivedBytes[..32];
        aes.IV = derivedBytes[32..48];
        using var encryptor = aes.CreateEncryptor();
        var plaintext = Encoding.UTF8.GetBytes(PublicPortalClientId);
        var ciphertext = encryptor.TransformFinalBlock(plaintext, 0, plaintext.Length);
        var payload = new byte[16 + ciphertext.Length];
        Encoding.ASCII.GetBytes("Salted__").CopyTo(payload, 0);
        salt.CopyTo(payload, 8);
        ciphertext.CopyTo(payload, 16);

        return Convert.ToBase64String(payload);
    }

    private sealed record UpstreamSearchResponse(
        [property: JsonPropertyName("success")] bool Success,
        [property: JsonPropertyName("page")] int Page,
        [property: JsonPropertyName("total")] int Total,
        [property: JsonPropertyName("data")] IReadOnlyList<UpstreamDataset>? Data);

    private sealed record UpstreamDataset(
        [property: JsonPropertyName("_id")] string Id,
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("publisher")] string? Publisher,
        [property: JsonPropertyName("description")] string? Description,
        [property: JsonPropertyName("license")] string? License,
        [property: JsonPropertyName("dateModifiedFormatted")] string? ModifiedDate,
        [property: JsonPropertyName("url")] string? Url,
        [property: JsonPropertyName("topics")] IReadOnlyList<string>? Topics,
        [property: JsonPropertyName("resources")] IReadOnlyList<UpstreamResource>? Resources);

    private sealed record UpstreamResource(
        [property: JsonPropertyName("_id")] string Id,
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("resourceFormat")] string? Format,
        [property: JsonPropertyName("resourceFile")] IReadOnlyList<UpstreamResourceFile>? Files);

    private sealed record UpstreamResourceFile(
        [property: JsonPropertyName("_id")] string? Id,
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("size")] long? Size);
}