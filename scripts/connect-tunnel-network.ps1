$ErrorActionPreference = "Stop"

$networkName = "livlog_default"
$containerName = "guitar-bazaar"

$networkExists = docker network ls --format "{{.Name}}" | Select-String -SimpleMatch $networkName
if (-not $networkExists) {
  throw "Docker network '$networkName' was not found."
}

$containerExists = docker ps --format "{{.Names}}" | Select-String -SimpleMatch $containerName
if (-not $containerExists) {
  throw "Docker container '$containerName' is not running."
}

$inspect = docker inspect $containerName | Out-String
if ($inspect -match [regex]::Escape($networkName)) {
  Write-Output "$containerName is already connected to $networkName."
  exit 0
}

docker network connect $networkName $containerName
Write-Output "Connected $containerName to $networkName."
