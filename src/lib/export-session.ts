import { HistorySession } from '@/types/history'

/**
 * Copy session content to clipboard
 */
export async function copyToClipboard(session: HistorySession): Promise<void> {
  try {
    await navigator.clipboard.writeText(session.content)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = session.content
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

/**
 * Export session as JSON file
 */
export function exportAsJson(session: HistorySession): void {
  const dataStr = JSON.stringify(session, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  downloadFile(blob, `session-${session.id.substring(0, 8)}.json`)
}

/**
 * Export session as formatted TXT file
 */
export function exportAsTxt(session: HistorySession): void {
  const txt = `
═══════════════════════════════════════════════════════
HISTÓRICO DE CONVERSA
═══════════════════════════════════════════════════════

ID: ${session.id}
Data: ${session.timestamp.toLocaleString('pt-BR')}
${session.agent ? `Agente: ${session.agent}\n` : ''}${session.project ? `Projeto: ${session.project}\n` : ''}Palavras: ${session.wordCount}

───────────────────────────────────────────────────────
CONTEÚDO
───────────────────────────────────────────────────────

${session.content}

═══════════════════════════════════════════════════════
Exportado em: ${new Date().toLocaleString('pt-BR')}
═══════════════════════════════════════════════════════
`
  const blob = new Blob([txt], { type: 'text/plain' })
  downloadFile(blob, `session-${session.id.substring(0, 8)}.txt`)
}

/**
 * Export session as CSV file
 */
export function exportAsCsv(session: HistorySession): void {
  const csv = [
    ['Campo', 'Valor'],
    ['ID', session.id],
    ['Timestamp', session.timestamp.toISOString()],
    ['Agente', session.agent || '(nenhum)'],
    ['Projeto', session.project || '(nenhum)'],
    ['Palavras', session.wordCount.toString()],
    ['Tags', session.tags.join('; ')],
    ['Conteúdo', `"${session.content.replace(/"/g, '""')}"`],
  ]
    .map((row) => row.join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  downloadFile(blob, `session-${session.id.substring(0, 8)}.csv`)
}

/**
 * Helper function to trigger file download
 */
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export multiple sessions as ZIP (utility for future use)
 * Note: This would require a ZIP library like jszip
 */
export async function exportAsMarkdown(sessions: HistorySession[]): Promise<void> {
  const markdown = `
# Histórico de Conversas Exportado

**Data de Exportação:** ${new Date().toLocaleString('pt-BR')}
**Total de Sessões:** ${sessions.length}

---

${sessions
  .map(
    (session, idx) => `
## Sessão ${idx + 1}

**ID:** ${session.id}
**Data:** ${session.timestamp.toLocaleString('pt-BR')}
**Agente:** ${session.agent || '(nenhum)'}
**Projeto:** ${session.project || '(nenhum)'}
**Palavras:** ${session.wordCount}

### Conteúdo

\`\`\`
${session.content}
\`\`\`

---
`
  )
  .join('\n')}
`

  const blob = new Blob([markdown], { type: 'text/markdown' })
  downloadFile(blob, `export-${Date.now()}.md`)
}
