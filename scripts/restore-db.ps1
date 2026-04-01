param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,
    [string]$ComposeFile = "docker-compose.yml",
    [string]$DbService = "db",
    [string]$Database = "ecommerce",
    [string]$DbUser = "postgres"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    throw "Backup file not found: $BackupFile"
}

Get-Content -Raw $BackupFile | docker compose -f $ComposeFile exec -T $DbService psql -U $DbUser -d $Database

Write-Host "Database restore completed from $BackupFile"
