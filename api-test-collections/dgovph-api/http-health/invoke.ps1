param([string]$BaseUrl = "http://localhost:5000")

$ErrorActionPreference = 'Stop'
$url = "$($BaseUrl.TrimEnd('/'))/api/health"
$response = Invoke-RestMethod -Uri $url -Method Get
$response | ConvertTo-Json -Depth 10
Write-Output "PASS: GET $url returned healthy API data."