# Nightly stats update for dilf.gg
#
# Exports the latest stats from the league database, shrinks any new player
# photos, and pushes both to the main branch on GitHub. GitHub Actions (.github/workflows/deploy.yml) then
# tests, builds and publishes the site, so this PC no longer needs Node/npm.
#
# Usage (PowerShell):
#   G:\dilf\dilf-app-v2\scripts\nightly.ps1           # normal nightly run
#   G:\dilf\dilf-app-v2\scripts\nightly.ps1 -DryRun   # everything except the push
#
# New player photo: save it as "First Last YEAR.png" in
#   G:\dilf\dilf-app-v2\public\images\profile_pics
# The next nightly run copies the original to G:\dilf\photo-originals,
# converts it to a small .webp (npm run photos) and publishes it. Node.js is
# only needed on nights when there is a new photo.
#
# Logs: G:\dilf\logs\nightly-YYYY-MM-DD.log (kept for 30 days)
#
# The Python scripts read their own settings; this script never opens
# credentials.json or config.json.

param(
    [switch]$DryRun
)

# Stop immediately if any PowerShell command fails
$ErrorActionPreference = "Stop"

# ---------- CONFIGURATION ----------
$envName = "deploy-env"
$condaBase = "G:\Program Files\Anaconda3"
$python = "$condaBase\envs\$envName\python.exe"
$pythonScripts = @(
    "G:\dilf\statsload.py",
    "G:\dilf\stats_view_to_js.py"
)
$packages = @("gspread", "psycopg2", "pandas", "oauth2client", "dotenv", "sqlalchemy")
$siteRepo = "G:\dilf\dilf-app-v2"
$statsFiles = @("src/playerStats.js", "src/orgStats.js")
$photoDir = "$siteRepo\public\images\profile_pics"
$photoOriginals = "G:\dilf\photo-originals"
$logDir = "G:\dilf\logs"
$keepLogsDays = 30
# -----------------------------------

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir ("nightly-" + (Get-Date -Format "yyyy-MM-dd") + ".log")
Start-Transcript -Path $logFile -Append | Out-Null

$exitCode = 0
try {
    Write-Host "=== Nightly stats update started $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="
    if ($DryRun) { Write-Host "DRY RUN: nothing will be pushed to GitHub." }

    # ---------- 1. Make sure the Python environment exists ----------
    Write-Host "Checking conda environment '$envName'..."
    $envs = & "$condaBase\Scripts\conda.exe" env list | Out-String
    if ($envs -notmatch $envName) {
        Write-Host "Environment not found. Creating '$envName'..."
        & "$condaBase\Scripts\conda.exe" create -y -n $envName python=3.12
        if ($LASTEXITCODE -ne 0) { throw "conda create failed" }
    }
    foreach ($pkg in $packages) {
        & $python -m pip install --quiet $pkg
        if ($LASTEXITCODE -ne 0) { throw "pip install $pkg failed" }
    }

    # ---------- 2. Get the latest site code ----------
    Write-Host "Pulling latest main from GitHub..."
    git -C $siteRepo pull --ff-only origin main
    if ($LASTEXITCODE -ne 0) { throw "git pull failed" }

    # ---------- 3. Export the stats ----------
    foreach ($script in $pythonScripts) {
        Write-Host "Running $script"
        & $python $script
        if ($LASTEXITCODE -ne 0) { throw "$script failed (exit code $LASTEXITCODE)" }
    }

    # ---------- 4. Shrink any new player photos ----------
    # A problem here is logged but does not stop the stats update; the
    # photo stays in the folder and is tried again the next night.
    $newPhotos = @(Get-ChildItem -Path $photoDir -Filter "*.png" -File)
    $photosDone = $false
    if ($newPhotos.Count -gt 0) {
        Write-Host "New photos: $($newPhotos.Name -join ', ')"
        if ($DryRun) {
            Write-Host "DRY RUN: skipping photo conversion."
        } else {
            try {
                New-Item -ItemType Directory -Force -Path $photoOriginals | Out-Null
                foreach ($photo in $newPhotos) {
                    Copy-Item -Path $photo.FullName -Destination $photoOriginals -Force
                }
                Push-Location $siteRepo
                try {
                    npm ci --no-audit --no-fund
                    if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
                    npm run photos
                    if ($LASTEXITCODE -ne 0) { throw "npm run photos failed" }
                } finally {
                    Pop-Location
                }
                $photosDone = $true
            }
            catch {
                Write-Host "WARNING: photo step failed, will retry tomorrow: $_"
            }
        }
    }

    # ---------- 5. Push changes; GitHub deploys the site ----------
    git -C $siteRepo add -- $statsFiles
    if ($photosDone) {
        git -C $siteRepo add -- "public/images/profile_pics/*.webp"
    }
    git -C $siteRepo diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "No stats or photo changes today. Nothing to push."
    } else {
        Write-Host "Changed files:"
        git -C $siteRepo diff --cached --stat
        if ($DryRun) {
            Write-Host "DRY RUN: skipping commit and push. Undoing the staging."
            git -C $siteRepo reset --quiet
        } else {
            $message = "Nightly stats update $(Get-Date -Format yyyy-MM-dd)"
            if ($photosDone) { $message += " with new player photos" }
            git -C $siteRepo commit -m $message
            if ($LASTEXITCODE -ne 0) { throw "git commit failed" }
            git -C $siteRepo push origin main
            if ($LASTEXITCODE -ne 0) { throw "git push failed" }
            Write-Host "Pushed. GitHub will test, build and publish dilf.gg in about 2 minutes."
        }
    }

    Write-Host "=== Nightly stats update finished ==="
}
catch {
    Write-Host "ERROR: $_"
    Write-Host "=== Nightly stats update FAILED ==="
    $exitCode = 1
}
finally {
    # Remove logs older than $keepLogsDays days
    Get-ChildItem -Path $logDir -Filter "nightly-*.log" |
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$keepLogsDays) } |
        Remove-Item -ErrorAction SilentlyContinue
    Stop-Transcript | Out-Null
}

# A non-zero exit code shows up as "Last Run Result" in Task Scheduler
exit $exitCode
