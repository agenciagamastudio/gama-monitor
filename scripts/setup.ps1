# GAMA Monitor — Setup Automático (Windows PowerShell)
# Instala ttyd em Windows

Write-Host "🔧 GAMA Monitor Setup" -ForegroundColor Green
Write-Host ""

# Check if ttyd already installed
if (Get-Command ttyd -ErrorAction SilentlyContinue) {
    Write-Host "✅ ttyd já está instalado" -ForegroundColor Green
    ttyd --version
    Write-Host ""
    Write-Host "🎉 GAMA Monitor pronto!" -ForegroundColor Green
    exit 0
}

Write-Host "🪟 Detectado Windows" -ForegroundColor Cyan
Write-Host ""

# Try scoop first
if (Get-Command scoop -ErrorAction SilentlyContinue) {
    Write-Host "📦 Scoop encontrado, instalando ttyd..." -ForegroundColor Yellow
    scoop install ttyd
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ttyd instalado com sucesso!" -ForegroundColor Green
        ttyd --version
        Write-Host ""
        Write-Host "🎉 GAMA Monitor pronto!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Para iniciar:" -ForegroundColor Cyan
        Write-Host "  npm run dev:all       (tudo junto)" -ForegroundColor Gray
        Write-Host "  npm run dev           (frontend)" -ForegroundColor Gray
        Write-Host "  npm run terminal      (terminal web)" -ForegroundColor Gray
        exit 0
    }
}

# Try winget
if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "📦 Windows Package Manager encontrado, instalando ttyd..." -ForegroundColor Yellow
    winget install tsl0922.ttyd
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ttyd instalado com sucesso!" -ForegroundColor Green
        ttyd --version
        Write-Host ""
        Write-Host "🎉 GAMA Monitor pronto!" -ForegroundColor Green
        exit 0
    }
}

# Neither found
Write-Host "❌ Nenhum package manager encontrado" -ForegroundColor Red
Write-Host ""
Write-Host "Opções de instalação:" -ForegroundColor Yellow
Write-Host "1. Instale Scoop: https://scoop.sh/" -ForegroundColor Gray
Write-Host "2. Ou Windows Package Manager (já vem em Windows 11)" -ForegroundColor Gray
Write-Host "3. Ou baixe direto: https://github.com/tsl0922/ttyd/releases" -ForegroundColor Gray
Write-Host ""
Write-Host "Depois rode: npm run setup" -ForegroundColor Cyan
exit 1
