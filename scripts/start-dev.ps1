param(
  [switch]$Web,
  [switch]$Ios
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$apiUrl = 'http://localhost:8080/api/products'
$apiReady = $false

function Test-TcpPort {
  param(
    [string]$HostName,
    [int]$Port
  )

  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $connect = $client.BeginConnect($HostName, $Port, $null, $null)
    if (-not $connect.AsyncWaitHandle.WaitOne(1000)) {
      return $false
    }

    $client.EndConnect($connect)
    return $true
  }
  catch {
    return $false
  }
  finally {
    $client.Close()
  }
}

try {
  $response = Invoke-RestMethod -Uri $apiUrl -TimeoutSec 3
  if ($response -is [array] -and $response.Count -gt 0) {
    $apiReady = $true
    Write-Host "API already running: $($response.Count) products loaded from MySQL."
  }
}
catch {
  $apiReady = $false
}

if (-not $apiReady) {
  $mysqlDeadline = (Get-Date).AddSeconds(90)
  Write-Host 'Waiting for MySQL on localhost:3306...'
  while (-not (Test-TcpPort -HostName 'localhost' -Port 3306)) {
    if ((Get-Date) -ge $mysqlDeadline) {
      throw 'MySQL did not become available on localhost:3306. Start the MySQL service and run npm.cmd run web again.'
    }
    Start-Sleep -Seconds 2
  }

  $backendDirectory = Join-Path $projectRoot 'backend'
  $backendCommand = 'cd /d "' + $backendDirectory +
    '" && "' + (Join-Path $backendDirectory 'mvnw.cmd') +
    '" spring-boot:run'

  Write-Host 'MySQL is available. Starting Spring Boot from the backend folder so backend/.env is loaded...'
  Start-Process -FilePath $env:ComSpec `
    -ArgumentList @('/k', $backendCommand) `
    -WorkingDirectory $backendDirectory

  $deadline = (Get-Date).AddSeconds(120)
  Write-Host 'Waiting for the API and MySQL product query...'
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-RestMethod -Uri $apiUrl -TimeoutSec 3
      if ($response -is [array] -and $response.Count -gt 0) {
        $apiReady = $true
        Write-Host "API ready: $($response.Count) products loaded from MySQL."
        break
      }

      throw 'API responded, but returned no products.'
    }
    catch {
      Start-Sleep -Seconds 2
    }
  }
}

if (-not $apiReady) {
  throw "The API did not return products within 120 seconds. Check the Spring Boot window, backend/.env, and MySQL. Expected endpoint: $apiUrl"
}

$expoPort = $null
for ($candidatePort = 8081; $candidatePort -le 8100; $candidatePort++) {
  $connections = Get-NetTCPConnection `
    -LocalPort $candidatePort `
    -ErrorAction SilentlyContinue
  if (@($connections).Count -gt 0) {
    continue
  }

  $listener = $null
  try {
    $listener = [System.Net.Sockets.TcpListener]::new(
      [System.Net.IPAddress]::Loopback,
      $candidatePort
    )
    $listener.Start()
    $listener.Stop()
    $expoPort = $candidatePort
    break
  }
  catch {
  }
  finally {
    if ($listener) { $listener.Stop() }
  }
}

if (-not $expoPort) {
  throw 'No free Expo port was found between 8081 and 8100.'
}

Write-Host "Starting Expo on port $expoPort. Keep this window and the Spring Boot window open."
Set-Location $projectRoot
if ($Web) {
  & npx.cmd expo start --web --clear --port $expoPort
}
elseif ($Ios) {
  & npx.cmd expo start --ios --clear --port $expoPort
}
else {
  & npx.cmd expo start --clear --port $expoPort
}
exit $LASTEXITCODE
