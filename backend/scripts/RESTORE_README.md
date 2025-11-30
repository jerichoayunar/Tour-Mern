# Restore & Decrypt Helpers

This folder contains utilities to inspect, decrypt (if needed), extract and safely restore backups created by the project's backup service.

Files
- `decrypt.cjs` - Node script to decrypt `.zip.enc` files produced by the backup service. Usage:
  ```powershell
  node decrypt.cjs "<ENCRYPTION_KEY_AT_LEAST_32_CHARS>" "C:\path\to\file.zip.enc" "C:\path\to\out.zip"
  ```

- `restore-backup.ps1` - PowerShell wrapper that:
  - Decrypts `.enc` (if `-Key` provided) using `decrypt.cjs`.
  - Lists and extracts the ZIP to an `extracted-<timestamp>` folder.
  - Locates a `*.archive` (mongodump) file and optionally restores it into a temporary DB using `mongorestore`.

- `run-restore-backup.cmd` - Windows shortcut that forwards arguments to `restore-backup.ps1` (see below).

Prerequisites
- Node.js (for `decrypt.cjs` when decrypting encrypted backups).
- PowerShell (v5+ on Windows). The script uses built-in `Expand-Archive`.
- MongoDB Database Tools (`mongorestore`) in PATH for restore operations.

Quick usage examples

1) Automated flow (plain `.zip`):
```powershell
cd C:\Users\coco\tour-mern
.\backend\scripts\restore-backup.ps1 -FilePath 'C:\temp\backups\backup-2025-11-30.zip' -TempDb 'tourdb_restore'
```

2) Encrypted `.zip.enc` (supply your encryption key):
```powershell
.\backend\scripts\restore-backup.ps1 -FilePath 'C:\temp\backups\backup-2025-11-30.zip.enc' -Key 'your-very-long-key-at-least-32-chars' -TempDb 'tourdb_restore'
```

3) Run from Windows using the shortcut (in `backend/scripts`):
```cmd
cd C:\Users\coco\tour-mern\backend\scripts
run-restore-backup.cmd "C:\temp\backups\backup-2025-11-30.zip" "" "tourdb_restore"
```

Notes & safety
- The PowerShell wrapper restores into a temporary DB (`tourdb_restore` by default) using namespace remapping so your production DB is not overwritten.
- Keep your encryption key secret. Do not paste it in chat or commit it to source control.
- Decrypted files and extracted folders remain on disk under the same folder as the downloaded file in a timestamped `extracted-...` folder.
- After verifying successful restore/inspection, delete any decrypted backups and the extracted folder.

If you want, I can add a small README entry to the repository root pointing to this helper and an example `Task` for running it automatically.
