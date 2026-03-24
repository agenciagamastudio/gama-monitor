# 👑 GAMA Monitor — Real-time Project Hub

Central de monitoramento e controle de todos os projetos Gama em tempo real com suporte a Design System dinâmico.

## 🎯 Features

- **Dashboard em Tempo Real** — Veja status de todos os projetos (online/offline)
- **Preview de Projetos** — Iframe com acesso direto ao localhost de cada projeto
- **Gerenciamento de Projetos** — Adicione, remova ou atualize projetos
- **Controle de Design System** — Troque o DS aplicado a todos os projetos de uma vez
- **Persistência Local** — Projetos salvos em localStorage
- **Rota de Tokens** — GET `/api/tokens` serve o CSS do Design System

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start
```

Acesso: `http://localhost:3015`

## 📊 Stack

- **Framework:** Next.js 15
- **Styling:** Tailwind CSS + Design Tokens Gama
- **Language:** TypeScript
- **UI Components:** Lucide React
- **Storage:** Browser localStorage

## 🎨 Design System

Paleta padrão **Gama**:
- Primary: `#88CE11` (verde vibrante)
- Dark: `#161616`
- Surfaces: `#272727`, `#353535`
- Text: `#FFFFFF`, `#A1A1AA`, `#71717A`

## 📦 Projetos Pré-cadastrados

| Nome | Porta | Pasta |
|------|-------|-------|
| DESIGN SYSTEM | 3000 | `GAMA_DESIGN_SYSTEM/gama-ds-platform` |
| JARVIS | 3014 | `GAMA_JARVIS` |
| NORT | 3016 | `GAMA_NORT` |
| FINANCEIRO | 3012 | `GAMA_FINANCEIRO/gama-financeiro-prime` |
| CALCULADORA | 3010 | `GAMA_CALCULADORA/gama-calculadora-app` |
| EXTENSAO | 3011 | `GAMA_EXTENSAO` |
| VOZ | 3017 | `GAMA_VOZ` |

## 🔌 API

### GET `/api/tokens`
Retorna o arquivo de tokens CSS do Design System ativo.

```bash
curl http://localhost:3015/api/tokens
```

Usado para injetar variáveis CSS dinamicamente em projetos clientes.

## 🛠️ Arquitetura

```
src/
├── app/
│   ├── api/
│   │   └── tokens/route.ts    ← Serve tokens CSS
│   ├── layout.tsx              ← Root layout
│   ├── page.tsx                ← Página principal
│   └── globals.css             ← Global styles
├── components/
│   ├── Sidebar.tsx             ← Menu lateral
│   ├── ProjectCard.tsx         ← Card do projeto
│   ├── AddProjectModal.tsx     ← Modal de novo projeto
│   └── DesignSystemSelector.tsx ← Seletor de DS
├── lib/
│   └── storage.ts              ← Persistência localStorage
└── types/
    └── project.ts              ← Tipos TypeScript
```

## 💾 localStorage

- `gama-monitor-projects` — Lista de projetos
- `gama-monitor-selected` — ID do projeto selecionado
- `gama-monitor-ds` — Design System ativo

## 📝 Próximos Passos

- [ ] Implementar verificação de status real (HTTP health check)
- [ ] WebSocket para atualização instantânea de Design System
- [ ] Integração com Git (branch info, últimos commits)
- [ ] Terminal integrável (xterm.js)
- [ ] Logs em tempo real de cada projeto
- [ ] Métricas de performance (Lighthouse)

## 👨‍💻 Desenvolvido com ❤️

Parte do ecossistema **Synkra AIOS** — Arquitetura de IA Orquestrada para Full Stack.

---

**Status:** ✅ Pronto para desenvolvimento
**Versão:** 1.0.0
**Última atualização:** 2026-03-24
