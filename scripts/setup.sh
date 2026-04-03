#!/bin/bash

# GAMA Monitor — Setup Automático
# Instala ttyd em qualquer OS

set -e

echo "🔧 GAMA Monitor Setup"
echo ""

# Detect OS
OS_TYPE=$(uname -s)

if [[ "$OS_TYPE" == "MINGW64_NT"* ]] || [[ "$OS_TYPE" == "MSYS_NT"* ]]; then
  # Windows (Git Bash/MSYS)
  echo "🪟 Detectado Windows"
  echo ""
  echo "Instalando ttyd via scoop..."

  if command -v scoop &> /dev/null; then
    echo "✅ Scoop encontrado, instalando ttyd..."
    scoop install ttyd
  elif command -v winget &> /dev/null; then
    echo "✅ Windows Package Manager encontrado, instalando ttyd..."
    winget install tsl0922.ttyd
  else
    echo "❌ Nenhum package manager encontrado"
    echo ""
    echo "Opções:"
    echo "1. Instale Scoop: https://scoop.sh/"
    echo "2. Ou use Windows Package Manager (winget)"
    echo "3. Ou baixe direto: https://github.com/tsl0922/ttyd/releases"
    exit 1
  fi

elif [[ "$OS_TYPE" == "Darwin" ]]; then
  # macOS
  echo "🍎 Detectado macOS"
  echo ""
  echo "Instalando ttyd via Homebrew..."

  if command -v brew &> /dev/null; then
    brew install ttyd
  else
    echo "❌ Homebrew não encontrado"
    echo "Instale: https://brew.sh/"
    exit 1
  fi

elif [[ "$OS_TYPE" == "Linux" ]]; then
  # Linux
  echo "🐧 Detectado Linux"
  echo ""
  echo "Instalando ttyd via apt..."

  if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y ttyd
  elif command -v pacman &> /dev/null; then
    sudo pacman -S ttyd
  elif command -v yum &> /dev/null; then
    sudo yum install ttyd
  else
    echo "❌ Nenhum package manager encontrado"
    echo "Instale manualmente: https://github.com/tsl0922/ttyd/releases"
    exit 1
  fi

else
  echo "❌ OS não reconhecido: $OS_TYPE"
  exit 1
fi

echo ""
echo "✅ Setup completo!"
echo ""
echo "Verificando ttyd..."
ttyd --version

echo ""
echo "🎉 GAMA Monitor pronto para usar!"
echo ""
echo "Para iniciar todos os serviços:"
echo "  npm run dev:all"
echo ""
echo "Ou separadamente:"
echo "  npm run dev       (Frontend)"
echo "  npm run terminal  (Terminal Web)"
echo "  npm run backend   (Backend)"
