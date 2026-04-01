param(
    [Parameter(Mandatory = $true)]
    [string]$DbHost,
    [string]$Database,
    [string]$DbUser,
    [string]$Password,
    [int]$Port = 5432,
    [string]$PgDumpPath = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe",
    [string]$BackupDir = "backups"
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $BackupDir "$Database-$timestamp.sql"

if (-not (Test-Path $PgDumpPath)) {
    throw "pg_dump not found at $PgDumpPath"
}

$env:PGPASSWORD = $Password
try {
    & $PgDumpPath -h $DbHost -p $Port -U $DbUser -d $Database > $backupFile
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "External PostgreSQL backup saved to $backupFile"
