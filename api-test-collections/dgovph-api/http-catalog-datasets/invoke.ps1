param([string]$BaseUrl = "http://localhost:5000")

$ErrorActionPreference = 'Stop'
$url = "$($BaseUrl.TrimEnd('/'))/api/catalog/datasets?page=1&pageSize=50"
$response = Invoke-RestMethod -Uri $url -Method Get
$datasetCount = @($response.items).Count
if ($datasetCount -eq 0) {
	throw 'The government catalog returned no public datasets.'
}

$response.items | Select-Object -First 5 name,publisher,modifiedDate | Format-Table -AutoSize
Write-Output "PASS: GET $url returned $datasetCount of $($response.total) public datasets on page 1."