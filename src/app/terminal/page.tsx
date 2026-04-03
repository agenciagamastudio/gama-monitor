'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function TerminalPage() {
  const [ttydAvailable, setTtydAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if ttyd is available
    const checkTtyd = async () => {
      try {
        await fetch('http://localhost:3020', {
          method: 'HEAD',
          mode: 'no-cors',
        })
        setTtydAvailable(true)
      } catch (error) {
        setTtydAvailable(false)
      }
    }

    checkTtyd()
  }, [])

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gama-dark border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-gama-text-secondary hover:text-white transition-colors text-sm font-semibold"
          >
            ← Voltar
          </Link>
          <h1 className="text-xl font-black text-gama-primary">⌨️ Terminal</h1>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {ttydAvailable === null ? (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              <span className="text-gama-text-secondary">Verificando...</span>
            </>
          ) : ttydAvailable ? (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-gama-text-secondary">ttyd • PowerShell</span>
            </>
          ) : (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-red-400">ttyd offline</span>
            </>
          )}
        </div>
      </header>

      {/* Terminal Container */}
      <div className="flex-1 bg-black relative overflow-hidden flex items-center justify-center">
        {ttydAvailable === null ? (
          // Loading state
          <div className="text-center">
            <div className="text-4xl mb-3">⌨️</div>
            <p className="text-gama-text-secondary text-sm">Verificando terminal web...</p>
          </div>
        ) : ttydAvailable ? (
          // ttyd available - show iframe
          <>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none z-0">
              <div className="text-center">
                <div className="text-4xl mb-3">⌨️</div>
                <p className="text-gama-text-secondary text-sm">Terminal carregando...</p>
              </div>
            </div>

            <iframe
              src="http://localhost:3020"
              className="w-full h-full border-0 bg-black"
              title="GAMA Terminal"
              allow="clipboard-read; clipboard-write"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            />
          </>
        ) : (
          // Graceful fallback
          <div className="max-w-md text-center px-6">
            <div className="text-6xl mb-4">⌨️</div>
            <h2 className="text-2xl font-black text-gama-primary mb-3">Terminal não disponível</h2>
            <p className="text-gama-text-secondary mb-6">
              O terminal web (ttyd) não está rodando no momento. Para usar o terminal integrado, execute:
            </p>

            <div className="bg-gama-surface rounded-xl p-4 mb-6 border border-white/10 font-mono text-sm text-left">
              <code className="text-gama-primary">npm run setup</code>
              <br />
              <code className="text-gama-primary">npm run terminal</code>
            </div>

            <p className="text-xs text-gama-text-secondary mb-6">
              Ou use o terminal PowerShell direto em seu sistema.
            </p>

            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gama-primary text-black font-black rounded-xl hover:brightness-110 transition-all"
            >
              ← Voltar ao Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
