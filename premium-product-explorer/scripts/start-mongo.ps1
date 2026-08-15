# Starts the local MongoDB replica-set instance used by the backend (port 27018).
# Prisma requires a replica set for transactions; the default MongoDB Windows
# service on 27017 runs standalone, so this project uses its own instance.
# Run this after a reboot if the backend can't connect.
$dataDir = "C:\Users\Dell\AppData\Local\MongoDB\rs0-data"
$logFile = "$dataDir\mongod.log"

if (-not (Test-Path $dataDir)) { New-Item -ItemType Directory -Force -Path $dataDir | Out-Null }

$running = Get-NetTCPConnection -LocalPort 27018 -State Listen -ErrorAction SilentlyContinue
if ($running) {
  Write-Host "mongod already listening on 27018."
} else {
  Start-Process -FilePath "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" `
    -ArgumentList "--replSet","rs0","--port","27018","--dbpath","$dataDir","--bind_ip","127.0.0.1","--logpath","$logFile" `
    -WindowStyle Hidden
  Start-Sleep -Seconds 8
}

& "C:\Program Files\MongoDB\Server\8.2\bin\mongosh.exe" --port 27018 --quiet --eval "try { db.adminCommand('ping'); print('MongoDB ready on 27018 (replica set rs0)') } catch (e) { print('Error: ' + e.message) }"