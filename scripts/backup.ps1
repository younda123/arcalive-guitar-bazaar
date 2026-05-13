param(
  [string]$OutputDir = "backups"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $root $OutputDir
$stagingDir = Join-Path $backupDir "bazaar-$timestamp"
$archivePath = Join-Path $backupDir "bazaar-$timestamp.zip"

New-Item -ItemType Directory -Force -Path $stagingDir | Out-Null

$dataPath = Join-Path $root "data"
$uploadsPath = Join-Path $root "public\uploads"

if (Test-Path $dataPath) {
  Copy-Item -Path $dataPath -Destination (Join-Path $stagingDir "data") -Recurse -Force
}

if (Test-Path $uploadsPath) {
  New-Item -ItemType Directory -Force -Path (Join-Path $stagingDir "public") | Out-Null
  Copy-Item -Path $uploadsPath -Destination (Join-Path $stagingDir "public\uploads") -Recurse -Force
}

Compress-Archive -Path (Join-Path $stagingDir "*") -DestinationPath $archivePath -Force
Remove-Item -LiteralPath $stagingDir -Recurse -Force

Write-Output "Backup created: $archivePath"
