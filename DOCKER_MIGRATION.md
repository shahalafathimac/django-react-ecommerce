# Docker backend + database migration

This project now uses a Django backend container and a persistent PostgreSQL container.

## What changed

- `docker-compose.yml` now has valid `services` and a persistent `postgres_data` volume.
- `Backend/Dockerfile` starts Django with `gunicorn` instead of the old FastAPI-style `uvicorn main:app`.
- `Backend/docker/entrypoint.sh` waits for PostgreSQL and runs migrations automatically.
- `scripts/backup-db.ps1` and `scripts/restore-db.ps1` provide a safe backup/restore flow.

## Safe migration steps

1. Back up the current database before changing containers.
   Example:
   `.\scripts\backup-db.ps1`
2. Start the new database and backend.
   Example:
   `docker compose up -d --build`
3. Restore the backup into the new Docker database if needed.
   Example:
   `.\scripts\restore-db.ps1 -BackupFile .\backups\ecommerce-YYYYMMDD-HHMMSS.sql`

## If your current database is not the existing Docker `db` service

Use `pg_dump` against the old PostgreSQL server first, then restore that dump into the new Docker database:

```powershell
.\scripts\backup-external-db.ps1 -DbHost OLD_HOST -Port OLD_PORT -DbUser OLD_USER -Password OLD_PASSWORD -Database OLD_DB
.\scripts\restore-db.ps1 -BackupFile .\backups\OLD_DB-YYYYMMDD-HHMMSS.sql
```

## Notes

- The PostgreSQL data lives in the named Docker volume `postgres_data`, so container recreation will not delete your data.
- The Docker PostgreSQL service publishes on host port `5433` by default so it can run alongside your existing local PostgreSQL on `5432` during migration.
- The backup step creates a plain SQL dump, which is the safest way to migrate data between Postgres containers.
