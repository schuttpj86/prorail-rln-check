# V004 Clean Branch - Cleanup Script
# This script removes all unnecessary files and folders

$rootPath = "c:\Users\PESCHU\DNV\EFT DNV GL - Documents\General\AI\Prorail-RLN"

Write-Host "Starting V004 Clean Branch cleanup..." -ForegroundColor Green
Write-Host ""

# ========================================
# ROOT LEVEL CLEANUP
# ========================================

Write-Host "Cleaning root level files..." -ForegroundColor Yellow

# Remove JSON files from root
Write-Host "  - Removing JSON files..."
Get-ChildItem -Path $rootPath -Filter "*.json" -File | Remove-Item -Force -ErrorAction SilentlyContinue

# Remove image folder
if (Test-Path "$rootPath\image") {
    Write-Host "  - Removing image folder..."
    Remove-Item -Path "$rootPath\image" -Recurse -Force -ErrorAction SilentlyContinue
}

# Remove jsapi-resources-main folder
if (Test-Path "$rootPath\jsapi-resources-main") {
    Write-Host "  - Removing jsapi-resources-main folder..."
    Remove-Item -Path "$rootPath\jsapi-resources-main" -Recurse -Force -ErrorAction SilentlyContinue
}

# ========================================
# CABLE-ROUTE-EVALUATOR CLEANUP
# ========================================

$appPath = "$rootPath\cable-route-evaluator"
Write-Host ""
Write-Host "Cleaning cable-route-evaluator folder..." -ForegroundColor Yellow

# Remove all markdown files
Write-Host "  - Removing markdown documentation files..."
Get-ChildItem -Path $appPath -Filter "*.md" -File | Remove-Item -Force -ErrorAction SilentlyContinue

# Remove specific files
$filesToRemove = @(
    "Dockerfile",
    "Route_1.json"
)

foreach ($file in $filesToRemove) {
    $filePath = Join-Path $appPath $file
    if (Test-Path $filePath) {
        Write-Host "  - Removing $file..."
        Remove-Item -Path $filePath -Force -ErrorAction SilentlyContinue
    }
}

# Remove examples folder
if (Test-Path "$appPath\examples") {
    Write-Host "  - Removing examples folder..."
    Remove-Item -Path "$appPath\examples" -Recurse -Force -ErrorAction SilentlyContinue
}

# ========================================
# SOURCE CODE CLEANUP
# ========================================

$srcPath = "$appPath\src"
Write-Host ""
Write-Host "Cleaning source code..." -ForegroundColor Yellow

# Remove V001 legacy files
$v001Files = @(
    "config.js",
    "main_backup.js",
    "utils\emcEvaluator.js",
    "utils\V2_FRAMEWORK_README.md"
)

foreach ($file in $v001Files) {
    $filePath = Join-Path $srcPath $file
    if (Test-Path $filePath) {
        Write-Host "  - Removing V001 file: $file..."
        Remove-Item -Path $filePath -Force -ErrorAction SilentlyContinue
    }
}

# Remove v1 folder
if (Test-Path "$srcPath\utils\v1") {
    Write-Host "  - Removing utils/v1 folder (V001 legacy)..."
    Remove-Item -Path "$srcPath\utils\v1" -Recurse -Force -ErrorAction SilentlyContinue
}

# Remove v2 folder if it still exists
if (Test-Path "$srcPath\utils\v2") {
    Write-Host "  - Removing utils/v2 folder (renamed to v4)..."
    Remove-Item -Path "$srcPath\utils\v2" -Recurse -Force -ErrorAction SilentlyContinue
}

# ========================================
# VERIFICATION
# ========================================

Write-Host ""
Write-Host "Cleanup complete! Verifying structure..." -ForegroundColor Green
Write-Host ""

# Check what remains
Write-Host "Remaining structure:" -ForegroundColor Cyan
Write-Host "  Root files:"
Get-ChildItem -Path $rootPath -File | Select-Object -ExpandProperty Name | ForEach-Object { Write-Host "    - $_" }

Write-Host ""
Write-Host "  cable-route-evaluator files:"
Get-ChildItem -Path $appPath -File | Select-Object -ExpandProperty Name | ForEach-Object { Write-Host "    - $_" }

Write-Host ""
Write-Host "  src/utils structure:"
Get-ChildItem -Path "$srcPath\utils" -Directory | Select-Object -ExpandProperty Name | ForEach-Object { Write-Host "    - $_/" }

Write-Host ""
Write-Host "✅ V004 clean branch is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Create docs/ folder"
Write-Host "  2. Create new README.md files"
Write-Host "  3. Update package.json, index.html, main.js"
Write-Host "  4. Test application: npm run dev"
Write-Host "  5. Commit changes: git add . && git commit -m 'feat: Clean V004 branch'"
Write-Host ""
