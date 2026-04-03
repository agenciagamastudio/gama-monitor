'use client'

import { HistorySession } from '@/types/history'

interface ChatBubblesProps {
  session: HistorySession
}

export function ChatBubbles({ session }: ChatBubblesProps) {
  // Parse messages with role detection
  const lines = session.content.split('\n')
  const messages: Array<{ role: 'user' | 'assistant'; text: string }> = []

  let currentRole: 'user' | 'assistant' = 'user'
  let currentText = ''

  for (const line of lines) {
    const lowerLine = line.toLowerCase()

    // Detect role changes
    if (lowerLine.match(/^(user|você|você:|usuário):/i)) {
      if (currentText.trim()) {
        messages.push({ role: currentRole, text: currentText.trim() })
      }
      currentRole = 'user'
      currentText = line.replace(/^(user|você|você:|usuário):\s*/i, '')
    } else if (lowerLine.match(/^(assistant|claude|ia|ai|resposta):/i)) {
      if (currentText.trim()) {
        messages.push({ role: currentRole, text: currentText.trim() })
      }
      currentRole = 'assistant'
      currentText = line.replace(/^(assistant|claude|ia|ai|resposta):\s*/i, '')
    } else {
      if (currentText) {
        currentText += '\n' + line
      } else {
        currentText = line
      }
    }
  }

  if (currentText.trim()) {
    messages.push({ role: currentRole, text: currentText.trim() })
  }

  // Fallback: if no markers found, treat entire content as assistant message
  if (messages.length === 0) {
    messages.push({
      role: 'assistant',
      text: session.content.trim(),
    })
  }

  // Helper para renderizar código
  const renderMessage = (text: string) => {
    const codeBlockRegex = /```([\s\S]*?)```/g
    const parts: Array<{ type: 'text' | 'code'; content: string; lang?: string }> = []

    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        })
      }

      // Add code block
      const codeContent = match[1]
      const lines = codeContent.trim().split('\n')
      const firstLine = lines[0]
      const isLanguageMarked = firstLine && !firstLine.includes(' ') && firstLine.length < 20
      const lang = isLanguageMarked ? firstLine : ''
      const code = isLanguageMarked ? lines.slice(1).join('\n') : codeContent.trim()

      parts.push({
        type: 'code',
        content: code,
        lang,
      })

      lastIndex = codeBlockRegex.lastIndex
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      })
    }

    return parts.length > 0
      ? parts
      : [
          {
            type: 'text' as const,
            content: text,
          },
        ]
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.role === 'assistant' && <span className="text-lg">🤖</span>}

          <div
            className={`max-w-2xl px-4 py-3 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-gama-primary/90 text-black rounded-br-none'
                : 'bg-gama-surface-accent text-gama-text rounded-bl-none border border-white/10'
            }`}
          >
            {renderMessage(msg.text).map((part, partIdx) =>
              part.type === 'code' ? (
                <div
                  key={partIdx}
                  className="bg-gama-darker rounded my-2 p-3 font-mono text-xs overflow-x-auto border border-white/5"
                >
                  {part.lang && (
                    <div className="text-gama-text-secondary text-xs mb-2 font-semibold">{part.lang}</div>
                  )}
                  <pre className="text-gama-text-secondary whitespace-pre-wrap break-words">{part.content}</pre>
                </div>
              ) : (
                <p key={partIdx} className="whitespace-pre-wrap break-words">
                  {part.content}
                </p>
              )
            )}
          </div>

          {msg.role === 'user' && <span className="text-lg">👤</span>}
        </div>
      ))}
    </div>
  )
}
