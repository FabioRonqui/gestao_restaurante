$ErrorActionPreference = 'Stop'
$backendDirectory = (Resolve-Path (Join-Path $PSScriptRoot '..\backend')).Path
$apiUrl = 'http://localhost:8080/api/products'

try {
  $products = Invoke-RestMethod -Uri $apiUrl -TimeoutSec 3
  if ($products -is [array] -and $products.Count -gt 0) {
    Write-Host "Spring Boot already serves $($products.Count) products at $apiUrl."
    exit 0
  }
}
catch {
}

$mysql = [System.Net.Sockets.TcpClient]::new()
try {
  $connect = $mysql.BeginConnect('localhost', 3306, $null, $null)
  if (-not $connect.AsyncWaitHandle.WaitOne(3000)) {
    throw 'MySQL is not accepting connections on localhost:3306.'
  }
  $mysql.EndConnect($connect)
}
catch {
  throw "Cannot start Spring Boot: $($_.Exception.Message) Start the MySQL80 service and try again."
}
finally {
  $mysql.Close()
}

if (-not (Test-Path (Join-Path $backendDirectory '.env'))) {
  throw 'backend/.env is missing. Copy backend/.env.example to backend/.env and set the local MySQL credentials.'
}

Write-Host 'Starting Spring Boot in this terminal. Press Ctrl+C to stop it.'
Set-Location $backendDirectory
& .\mvnw.cmd spring-boot:run
exit $LASTEXITCODE
