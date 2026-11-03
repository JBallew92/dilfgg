# Nightly stats update for dilf.gg
#
# Exports the latest stats from the league database and pushes them to the
# main branch on GitHub. GitHub Actions (.github/workflows/deploy.yml) then
# tests, builds and publishes the site, so this PC no longer needs Node/npm.
#
# Usage (PowerShell):
#   G:\dilf\dilf-app-v2\scripts\nightly.ps1           # normal nightly run
#   G:\dilf\dilf-app-v2\scripts\nightly.ps1 -DryRun   # everything except the push
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

    # ---------- 4. Push changed stats; GitHub deploys the site ----------
    git -C $siteRepo add -- $statsFiles
    git -C $siteRepo diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "No stats changes today. Nothing to push."
    } else {
        Write-Host "Changed files:"
        git -C $siteRepo diff --cached --stat
        if ($DryRun) {
            Write-Host "DRY RUN: skipping commit and push. Undoing the staging."
            git -C $siteRepo reset --quiet -- $statsFiles
        } else {
            git -C $siteRepo commit -m "Nightly stats update $(Get-Date -Format yyyy-MM-dd)"
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
