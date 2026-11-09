param([string]$BaseUrl = "http://localhost:5000")

$ErrorActionPreference = 'Stop'
$url = "$($BaseUrl.TrimEnd('/'))/api/budget-records/not-a-guid"
$response = Invoke-WebRequest -Uri $url -Method Get -SkipHttpErrorCheck
if ($response.StatusCode -ne 400) {
    throw "Expected HTTP 400 for an invalid record ID; received $($response.StatusCode)."
}

$response.Content
Write-Output "PASS: GET $url returned HTTP 400 for an invalid record ID."