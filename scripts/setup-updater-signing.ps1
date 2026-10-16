param(
    [string]$KeyPath = "$HOME\.tauri\trade-blueprint.key"
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

Write-Host "Trade Blueprint — configuração da assinatura do updater" -ForegroundColor Green
Write-Host "Este script gera o par de chaves localmente. A chave privada NÃO é enviada ao repositório."

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm não foi encontrado. Instale o Node.js antes de continuar."
}

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

if (-not (Test-Path "node_modules")) {
    Write-Step "Instalando dependências do projeto"
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install falhou." }
}

$keyDirectory = Split-Path -Parent $KeyPath
if (-not (Test-Path $keyDirectory)) {
    New-Item -ItemType Directory -Path $keyDirectory -Force | Out-Null
}

if (Test-Path $KeyPath) {
    Write-Host ""
    Write-Host "Já existe uma chave privada em:" -ForegroundColor Yellow
    Write-Host "  $KeyPath"
    Write-Host "Ela não será sobrescrita automaticamente."
} else {
    Write-Step "Gerando o par de chaves do Tauri"
    Write-Host "O Tauri poderá pedir uma senha para proteger a chave privada."
    npx tauri signer generate -w $KeyPath
    if ($LASTEXITCODE -ne 0) { throw "A geração das chaves falhou." }
}

$publicCandidates = @(
    "$KeyPath.pub",
    "$KeyPath.pubkey"
)

$publicPath = $publicCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

Write-Step "Arquivos locais"
Write-Host "Chave privada:"
Write-Host "  $KeyPath" -ForegroundColor Yellow
Write-Host "Nunca faça commit deste arquivo e não compartilhe seu conteúdo em chats ou issues."

if ($publicPath) {
    Write-Host ""
    Write-Host "Chave pública:"
    Write-Host "  $publicPath"
    Write-Host ""
    Write-Host "Conteúdo da chave pública:" -ForegroundColor Green
    Get-Content $publicPath -Raw
} else {
    Write-Host ""
    Write-Host "Não localizei automaticamente o arquivo da chave pública." -ForegroundColor Yellow
    Write-Host "Verifique os arquivos criados ao lado da chave privada e consulte a saída do comando do Tauri."
}

Write-Step "Cadastre no GitHub"
Write-Host "Repository variable:"
Write-Host "  TAURI_UPDATER_PUBLIC_KEY = conteúdo da chave pública"
Write-Host ""
Write-Host "Repository secrets:"
Write-Host "  TAURI_SIGNING_PRIVATE_KEY = conteúdo COMPLETO de $KeyPath"
Write-Host "  TAURI_SIGNING_PRIVATE_KEY_PASSWORD = senha usada na geração (se houver)"

Write-Step "Onde cadastrar"
Write-Host "GitHub > repositório > Settings > Secrets and variables > Actions"
Write-Host "Use a aba Variables para TAURI_UPDATER_PUBLIC_KEY."
Write-Host "Use a aba Secrets para a chave privada e a senha."

Write-Step "Próxima validação"
Write-Host "Depois de cadastrar os valores, execute o workflow:"
Write-Host "  Signed Release Readiness"
Write-Host ""
Write-Host "Quando ele passar, a Release assinada estará pronta para ser publicada."
