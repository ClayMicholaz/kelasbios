# Script untuk membersihkan lock files dan restart dev server
# Jalankan dengan: .\clean-dev.ps1

Write-Host "🧹 Membersihkan lock files dan proses Next.js..." -ForegroundColor Yellow

# Stop all Node.js processes
Write-Host "`n1. Menghentikan proses Node.js yang berjalan..." -ForegroundColor Cyan
$processes = Get-Process | Where-Object {$_.ProcessName -eq "node"}
if ($processes) {
    Write-Host "   Ditemukan $($processes.Count) proses Node.js:" -ForegroundColor Yellow
    $processes | ForEach-Object {
        Write-Host "   - PID: $($_.Id)" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   ✓ Semua proses Node.js dihentikan" -ForegroundColor Green
} else {
    Write-Host "   ✓ Tidak ada proses Node.js yang berjalan" -ForegroundColor Green
}

# Check for specific ports
Write-Host "`n2. Memeriksa port 3000 dan 3001..." -ForegroundColor Cyan
$portsToCheck = @(3000, 3001)
foreach ($port in $portsToCheck) {
    $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "   Port $port digunakan oleh PID $($process.Id) ($($process.ProcessName))" -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            Write-Host "   ✓ Proses di port $port dihentikan" -ForegroundColor Green
        }
    } else {
        Write-Host "   ✓ Port $port tersedia" -ForegroundColor Green
    }
}

# Remove lock file, dev folder, and cache
Write-Host "`n3. Menghapus lock files dan cache..." -ForegroundColor Cyan
$itemsToRemove = @(
    ".\.next\dev",
    ".\.next\cache",
    ".\.next\trace"
)

foreach ($item in $itemsToRemove) {
    if (Test-Path $item) {
        Remove-Item $item -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ $item dihapus" -ForegroundColor Green
    }
}

# Wait a moment
Write-Host "`n⏳ Menunggu cleanup selesai..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

# Start dev server
Write-Host "`n4. Menjalankan dev server..." -ForegroundColor Cyan
Write-Host "   → npm run dev`n" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
npm run dev
