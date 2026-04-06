# Local server + browser — run: powershell -ExecutionPolicy Bypass -File open-index.ps1
Set-Location $PSScriptRoot
$port = 8765
Start-Process cmd -ArgumentList '/k', "cd /d `"$PSScriptRoot`" && py -m http.server $port"
Start-Sleep -Seconds 2
Start-Process "http://localhost:${port}/index.html"
Write-Host "Server running in the other window. Close it when done."
