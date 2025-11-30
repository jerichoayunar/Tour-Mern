# Inspecting Backups (ZIP) — Guide

This document shows safe, repeatable steps to inspect a backup created by the project's backup service. It covers listing ZIP contents, extracting, locating the MongoDB dump, and safely restoring into a temporary DB for inspection.

Location of helper scripts
- `backend/scripts/decrypt.cjs` — decrypt `.zip.enc` backups (IV is prepended to file).
- `backend/scripts/restore-backup.ps1` — PowerShell wrapper that lists/extracts and optionally restores to a temporary DB.
- `backend/scripts/run-restore-backup.cmd` — Windows shortcut that calls the PowerShell wrapper.

What the backup contains
- A MongoDB archive produced by `mongodump --archive=... --gzip` (file name like `dump-<timestamp>.archive`).
- The `uploads/` folder (if present) containing files uploaded by users.
- The ZIP file `backup-<timestamp>.zip` (or `*.zip.enc` if encrypted).

Prerequisites
- PowerShell (Windows). Commands below are PowerShell-friendly.
- Node.js (only required if decrypting `.zip.enc`).
- MongoDB Database Tools (`mongorestore`, `bsondump`) for restore/inspection.
- `mongosh` to run queries against a temporary DB.

Safety first
- Work on a copy of the downloaded backup file.
- By default, the restore commands in this guide map data into a temporary DB (`tourdb_inspect`) to avoid touching production data.
- Delete decrypted files and extracted folders after inspection.

1) Quick list of ZIP contents (no extraction)
```powershell
$zipPath = 'C:\Users\coco\Downloads\tour-mern-backup-2025-11-30T09-44-53-685Z.zip'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$zip.Entries | Select-Object FullName, Length | Format-Table -AutoSize
$zip.Dispose()
```

Explanation:
- `Add-Type -AssemblyName System.IO.Compression.FileSystem`: loads the .NET compression helper so PowerShell can read ZIP files.
- `OpenRead($zipPath)`: opens the ZIP without extracting it.
- `Entries | Select-Object FullName, Length`: lists every file inside the ZIP and its size — useful to confirm the presence of the DB archive and uploads.
- `Dispose()`: closes the ZIP file handle.

What to look for:
- A `dump-<timestamp>.archive` file (the MongoDB archive).
- An `uploads/` folder (images, attachments).
- Any `.bson`, `.json`, or `.gz` files.

2) Extract the ZIP (to inspect files)
```powershell
$zipPath = 'C:\Users\coco\Downloads\tour-mern-backup-2025-11-30T09-44-53-685Z.zip'
$dest = Join-Path (Split-Path $zipPath -Parent) ("extracted-" + (Get-Date -Format yyyyMMdd-HHmmss))
Expand-Archive -Path $zipPath -DestinationPath $dest -Force
Write-Host "Extracted to: $dest"
```

Explanation:
- `Split-Path $zipPath -Parent`: gets the folder containing the ZIP so extraction happens next to the ZIP file.
- `Join-Path ... "extracted-<timestamp>"`: builds a unique extraction folder name to avoid overwriting previous extractions.
- `Expand-Archive`: extracts the ZIP contents to the destination folder.
- `-Force`: overwrites existing files in the destination if they exist.

3) Show what was extracted (find the Mongo dump)
```powershell
Get-ChildItem -Path $dest -Recurse -File | Select-Object FullName, Length | Format-Table -AutoSize
# Show likely DB dump files only
Get-ChildItem -Path $dest -Recurse -File | Where-Object { $_.Extension -in '.archive', '.bson', '.json', '.gz' } | Select-Object FullName, Length
```

Explanation:
- `Get-ChildItem -Recurse -File`: lists every file under the extracted folder including nested directories.
- `Select-Object FullName, Length`: shows the full path and file size which helps you spot large dump files (the DB archive).
- The `Where-Object` filter narrows output to file types commonly used by mongodump (`.archive`, `.bson`, `.json`, `.gz`).

4) If you found `*.archive` — safe, non-destructive inspection (restore to temporary DB)
```powershell
# replace with the real archive file path you found
$archive = 'C:\Users\coco\Downloads\extracted-YYYYMMDD-HHMMSS\dump-2025-11-30.archive'
mongorestore --archive="$archive" --gzip --nsFrom='tourdb.(.*)' --nsTo='tourdb_inspect.$1'

# inspect collections and sample documents
mongosh "mongodb://localhost:27017/tourdb_inspect" --eval "var names=db.getCollectionNames(); names.forEach(n=>{ print('---',n,'count=',db.getCollection(n).count()); printjson(db.getCollection(n).findOne()) });"
```

Explanation:
- `mongorestore --archive=... --gzip`: restores a mongodump archive file that was created with `--archive` and `--gzip`.
- `--nsFrom`/`--nsTo`: remaps namespaces so data originally in `tourdb.*` is restored into `tourdb_inspect.*` (prevents overwriting production).
- The `mongosh` command connects to the temporary DB and prints each collection name, document count, and one sample document — a quick verification that the data looks correct.

Notes:
- `--nsFrom`/`--nsTo` remaps namespaces so original `tourdb.*` restores to `tourdb_inspect.*`.
- If `mongorestore` is not found, install MongoDB Database Tools (https://www.mongodb.com/try/download/database-tools).

5) If the backup extracted to a folder of BSON files (folder format)
```powershell
# restore folder format (maps namespaces similarly)
mongorestore --dir='C:\path\to\extracted\dump-folder' --nsFrom='tourdb.(.*)' --nsTo='tourdb_inspect.$1'

# Or inspect a single BSON file by converting to JSON (requires bsondump)
bsondump --outFile C:\temp\sample_users.json C:\path\to\extracted\dump-folder\users.bson
Get-Content C:\temp\sample_users.json -TotalCount 20
```

Explanation:
- `mongorestore --dir=...`: restores from directory format (raw BSON/JSON files) created by `mongodump` when not using `--archive`.
- `bsondump`: converts a `.bson` file to JSON so you can inspect documents without restoring the whole DB.
- `Get-Content -TotalCount 20`: shows the first 20 lines of the converted JSON file to get a sample of documents.

6) If the ZIP is encrypted (`*.zip.enc`)
- Decrypt using the included Node script `backend/scripts/decrypt.cjs`:
```powershell
node backend\scripts\decrypt.cjs "<YOUR_KEY_AT_LEAST_32_CHARS>" "C:\path\to\backup.zip.enc" "C:\path\to\backup.zip"
```

Explanation:
- This Node script reads the first 16 bytes of the `.enc` file as the IV and decrypts the remainder with AES-256-CBC using the provided key (first 32 characters). The output is a plain `.zip` file you can then inspect as above.
- Then follow steps 1–5 on the decrypted ZIP.

7) Cleanup when done
```powershell
# drop the temporary DB
mongosh "mongodb://localhost:27017" --eval "db.getSiblingDB('tourdb_inspect').dropDatabase()"

# remove the extracted folder
Remove-Item -Recurse -Force $dest
```

Explanation:
- `dropDatabase()`: permanently removes the temporary DB created for inspection. Run this when you no longer need the inspected data.
- `Remove-Item -Recurse -Force $dest`: deletes the extracted files and any decrypted ZIPs to avoid leaving sensitive data on disk.

8) Quick automated option
- Use the PowerShell wrapper to list & extract automatically:
```powershell
.\backend\scripts\restore-backup.ps1 -FilePath 'C:\path\to\backup.zip' -TempDb 'tourdb_inspect'
# Answer 'N' if you only want to extract and inspect without restoring.
```

Troubleshooting
- `mongorestore` not found: install MongoDB Database Tools and add to PATH.
- `mongosh` not found: install MongoDB Shell or run via your MongoDB client.
- If the archive is missing or very small, the backup may have failed — check the `BackupJob` records in MongoDB for the job status and errors.

Security & hygiene
- Do not commit tokens, decrypted backups, or encryption keys to source control. Ensure `.gitignore` excludes `.gdrive_token.json` and decrypted files.
- Delete decrypted files and extracted folders after verification.

If you want, paste the output of the ZIP-list command or the extracted listing here and I will confirm whether the dump and uploads look correct.
