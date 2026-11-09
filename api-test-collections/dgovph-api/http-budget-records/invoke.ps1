param([string]$BaseUrl = "http://localhost:5000")

$ErrorActionPreference = 'Stop'
$url = "$($BaseUrl.TrimEnd('/'))/api/budget-records"
$response = Invoke-RestMethod -Uri $url -Method Get
$response | ConvertTo-Json -Depth 10
Write-Output "PASS: GET $url returned budget-record data."