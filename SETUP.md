# Setup Terminal Web (ttyd)

## Instalação Obrigatória

O Terminal Web do GAMA Monitor usa **ttyd** — uma ferramenta externa que não vem instalada com npm.

### Opção 1 — Scoop (Recomendado)

Se você tem Scoop instalado:

```bash
scoop install ttyd
```

### Opção 2 — Windows Package Manager

```bash
winget install tsl0922.ttyd
```

### Opção 3 — Instalação Manual

1. Baixe o binário em: https://github.com/tsl0922/ttyd/releases/latest
2. Procure por `ttyd.exe` ou `ttyd-x86_64-pc-windows-gnu.zip`
3. Extraia e coloque em uma pasta no PATH ou na raiz do projeto

## Verificar Instalação

```bash
ttyd --version
```

Deve retornar a versão do ttyd (ex: `ttyd 1.7.0`).

## Usar o Terminal

### Desenvolvimento (sem ttyd automático)

Em um terminal:
```bash
npm run dev      # Sobe gama-monitor em localhost:3015
```

Em outro terminal:
```bash
npm run terminal # Sobe ttyd em localhost:3020
```

### Desenvolvimento (ttyd automático)

```bash
npm run dev:full # Sobe ambos em paralelo
```

### Terminal Específico

```bash
npm run terminal      # PowerShell
npm run terminal:cmd  # cmd.exe
```

## Após Instalar

1. Instale ttyd conforme instruções acima
2. Execute `npm install` para instalar `concurrently` se ainda não estiver instalado
3. Reinicie o gama-monitor (se já estava rodando)
4. Acesse: http://localhost:3015/terminal
5. O terminal PowerShell deve aparecer imediatamente

## Troubleshooting

### "ttyd not found"
- Verifique se instalou com scoop/winget ou se ttyd.exe está no PATH
- Tente reiniciar o terminal/prompt

### "Port 3020 already in use"
- Outra instância de ttyd está rodando
- Kill com: `taskkill /IM ttyd.exe /F`
- Ou mude a porta em `start.js` de 3020 para 3021

### Terminal não carrega no iframe
- Verifique no browser console (F12) se há erros CORS
- Confirme que ttyd está rodando em localhost:3020
- Tente acessar direto: http://localhost:3020

### Conexão recusada ao acessar /terminal
- Verifique se ttyd está rodando: `tasklist | findstr ttyd`
- Se não estiver, rode manualmente: `npm run terminal`
- Ou use `npm run dev:full` para subir ambos juntos

## Acessando do Celular (Mesma Rede WiFi)

1. Encontre o IP da sua máquina: `ipconfig` (procure por "IPv4 Address")
2. No celular, acesse: `http://{seu-ip}:3015/terminal`

## Acessando de Qualquer Lugar (Cloudflare Tunnel)

```bash
npm run tunnel
```

Isso gera uma URL pública que você pode acessar de qualquer lugar.

---

## Referências

- **ttyd GitHub:** https://github.com/tsl0922/ttyd
- **xterm.js:** https://xtermjs.org/
- **Scoop:** https://scoop.sh/
