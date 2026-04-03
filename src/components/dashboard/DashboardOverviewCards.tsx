'use client'

interface Card {
  label: string
  value: string | number
  emoji: string
  color: string
}

interface DashboardOverviewCardsProps {
  cards: Card[]
}

export function DashboardOverviewCards({ cards }: DashboardOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`${card.color} rounded-lg p-6 border border-white/10 flex flex-col items-center justify-center text-center`}
        >
          <div className="text-4xl mb-2">{card.emoji}</div>
          <div className="text-3xl font-black text-gama-primary mb-1">{card.value}</div>
          <div className="text-xs text-gama-text-secondary font-semibold">{card.label}</div>
        </div>
      ))}
    </div>
  )
}
