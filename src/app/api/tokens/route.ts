import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const tokensPath = join(
      process.cwd(),
      '..',
      'GAMA_DESIGN_SYSTEM',
      'gama-ds-platform',
      'design-tokens',
      'tokens.css'
    )

    const tokens = readFileSync(tokensPath, 'utf-8')

    return new NextResponse(tokens, {
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error reading tokens:', error)
    return new NextResponse('/* Tokens not found */', {
      status: 404,
      headers: {
        'Content-Type': 'text/css',
      },
    })
  }
}
