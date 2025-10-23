Write-Host "Killing processes on ports 3000 and 5000..." -ForegroundColor Yellow

# Kill processes on port 5000
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    $processId = $port5000.OwningProcess
    Write-Host "Killing process $processId on port 5000" -ForegroundColor Red
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

# Kill processes on port 3000
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $processId = $port3000.OwningProcess
    Write-Host "Killing process $processId on port 3000" -ForegroundColor Red
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

# Kill any node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Ports cleared!" -ForegroundColor Green
Start-Sleep -Seconds 2