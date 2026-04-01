param(
    [string]$ComposeFile = "docker-compose.yml",
    [string]$DbService = "db",
    [string]$Database = "ecommerce",
    [string]$DbUser = "postgres",
    [string]$BackupDir = "backups"
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $BackupDir "ecommerce-$timestamp.sql"

docker compose -f $ComposeFile exec -T $DbService pg_dump -U $DbUser -d $Database > $backupFile

Write-Host "Database backup saved to $backupFile"
