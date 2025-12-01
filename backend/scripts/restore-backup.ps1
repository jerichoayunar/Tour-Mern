param(
  [Parameter(Mandatory=$true)][string]$FilePath,
  [string]$Key,
  [string]$TempDb = 'tourdb_restore'
)

Set-StrictMode -Version Latest

$full = (Resolve-Path $FilePath).Path
if (-not (Test-Path $full)) { Write-Error "File not found: $full"; exit 2 }

$ext = [System.IO.Path]::GetExtension($full)
$workDir = Join-Path -Path (Split-Path $full -Parent) -ChildPath ("extracted-" + (Get-Date -Format yyyyMMdd-HHmmss))
New-Item -ItemType Directory -Path $workDir | Out-Null

if ($ext -eq '.enc') {
  if (-not $Key) { Write-Error 'File looks encrypted (.enc). Provide -Key to decrypt.'; exit 3 }
  $node = Get-Command node -ErrorAction SilentlyContinue
  if (-not $node) { Write-Error 'node is required to run decrypt.cjs. Install Node.js and ensure it is in PATH.'; exit 4 }
  $decryptScript = Join-Path -Path $PSScriptRoot -ChildPath 'decrypt.cjs'
  if (-not (Test-Path $decryptScript)) { Write-Error "decrypt script not found: $decryptScript"; exit 5 }
  $decryptedZip = Join-Path -Path $workDir -ChildPath ([System.IO.Path]::GetFileNameWithoutExtension($full) + '.zip')
  Write-Host 'Decrypting to' $decryptedZip
  & node $decryptScript $Key $full $decryptedZip
  if ($LASTEXITCODE -ne 0) { Write-Error 'Decryption failed'; exit 6 }
  $zipToExtract = $decryptedZip
} else {
  $zipToExtract = $full
}

Try {
  Write-Host 'Listing archive contents...'
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zip = [System.IO.Compression.ZipFile]::OpenRead($zipToExtract)
  $zip.Entries | ForEach-Object { Write-Host $_.FullName $("(`${($_.Length)}` bytes)") }
  $zip.Dispose()
} Catch {
  Write-Warning 'Not a valid zip or failed to read archive. It may be a mongodump archive file directly.'
}

if ($zipToExtract -and (Test-Path $zipToExtract)) {
  try {
    Expand-Archive -Path $zipToExtract -DestinationPath $workDir -Force
    Write-Host 'Extracted to' $workDir
  } catch {
    Write-Warning 'Failed to extract with Expand-Archive, archive may contain a single mongodump --archive file. Copying file to workdir.'
    Copy-Item -Path $zipToExtract -Destination $workDir
  }
}

$archiveFile = Get-ChildItem -Path $workDir -Recurse -File -Filter '*.archive' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $archiveFile) {
  $possible = Get-ChildItem -Path $workDir -File | Select-Object -First 1
  if ($possible) { $archiveFile = $possible }
}

if (-not $archiveFile) {
  Write-Warning 'No archive/dump file found. Look inside the extracted folder and restore manually if needed.'
  Write-Host 'Folder:' $workDir
  exit 0
}

Write-Host 'Found dump/archive file:' $archiveFile.FullName

$restore = Read-Host "Restore into temporary DB '$TempDb'? (y/N)"
if ($restore -and $restore.ToLower().StartsWith('y')) {
  $mongorestore = Get-Command mongorestore -ErrorAction SilentlyContinue
  if (-not $mongorestore) { Write-Error 'mongorestore not found in PATH. Install MongoDB Database Tools and ensure mongorestore is available.'; exit 7 }
  Write-Host 'Restoring archive to temporary DB' $TempDb
  & mongorestore --archive=$archiveFile.FullName --gzip --nsFrom='tourdb.(.*)' --nsTo="$TempDb.$1"
  if ($LASTEXITCODE -ne 0) { Write-Error 'mongorestore failed'; exit 8 }
  Write-Host 'Restore completed into' $TempDb
}

Write-Host 'Done. Work directory:' $workDir
