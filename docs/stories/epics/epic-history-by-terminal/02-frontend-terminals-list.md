# Story 1.2: Frontend - Display Terminals List

**Story ID:** `EPIC-002-02`  
**Status:** Draft  
**Owner:** @dev (Dex)  
**Effort:** 1-2 hours  
**Complexity:** Medium  
**Depends on:** Story 1.1 ✅  
**Created:** 2026-04-03

---

## 📖 User Story

> As a user looking at my history,  
> I want to see a list of terminals (not 50 individual messages),  
> So that I can quickly see which terminal was active, for how long, and what was the last message.

---

## 🎯 Description

Refactor the Historic page to display **terminals as primary entity** instead of individual events.

**What users will see:**
```
📱 Terminal 1 (session ID: abc123)
   ├─ 15 messages
   ├─ Duration: 4 hours 5 minutes
   ├─ Last message: "ola"
   ├─ Project: ~/GAMA_MONITOR
   └─ [Expand] to see all messages

📱 Terminal 2 (session ID: def456)
   ├─ 12 messages
   ├─ Duration: 2 hours
   ├─ Last message: "/logout"
   ├─ Project: ~/Desktop
   └─ [Expand] to see all messages
```

---

## ✅ Acceptance Criteria

### Terminal List Display
- [ ] Terminals displayed in descending order (most recent first)
- [ ] Each terminal shows:
  - [ ] Icon (📱 or similar)
  - [ ] Message count (e.g., "15 messages")
  - [ ] Duration (e.g., "4 hours 5 minutes")
  - [ ] Last message preview (truncated to 80 chars)
  - [ ] Project/directory (from session data)
  - [ ] Timestamp (lastTime, human readable)
- [ ] Terminals are clickable/expandable

### Expand/Collapse Functionality
- [ ] Click terminal → expands to show all messages
- [ ] Messages display in chronological order (oldest first)
- [ ] Messages use existing ChatBubbles component
- [ ] Click again → collapses terminal
- [ ] State persisted in localStorage (which terminals expanded)

### Search & Filters
- [ ] Search works on terminal-level (searches all messages in terminal)
- [ ] Filter by project still works
- [ ] Filter by date range still works
- [ ] Results highlight matched terminals

### Favorites
- [ ] Favorites tab shows favorite terminals (not messages)
- [ ] Favorite button is terminal-level (not message-level)
- [ ] localStorage key: `history-favorites-terminals` (distinct from message favorites)

### Styling
- [ ] Match existing Gama Design System colors
- [ ] Terminal cards: `bg-gama-surface` with `border-white/10`
- [ ] Hover effect: `hover:border-gama-primary/30`
- [ ] Duration text: `text-gama-text-secondary`
- [ ] Count text: `text-gama-primary` (bold)
- [ ] Responsive on mobile (collapse to single column)

### Performance
- [ ] List renders in <200ms (even with 4 terminals expanded)
- [ ] Expand/collapse transition is smooth
- [ ] No layout shift when expanding

---

## 📋 Technical Details

### Files to Modify/Create

```
src/components/HistoryTerminalsList.tsx (RENAME from HistorySessionsList.tsx)
├─ Props: terminals: GroupedSession[], selectedTerminal?, onSelectTerminal?
├─ State: expandedTerminals (Set), search, filters
└─ Render: List of terminals with expand/collapse

src/components/TerminalCard.tsx (NEW)
├─ Props: terminal: GroupedSession, isExpanded, onToggle
├─ Render: Terminal header + optional messages list
└─ Uses: ChatBubbles component for messages

src/lib/history-storage.ts (MODIFY)
├─ Add: getFavoriteTerminals(terminalIds: string[]): boolean
├─ Add: addFavoriteTerminal(terminalId: string)
├─ Add: removeFavoriteTerminal(terminalId: string)
└─ Add: toggleFavoriteTerminal(terminalId: string)

src/app/historic/page.tsx (MODIFY)
├─ Import HistoryTerminalsList instead of HistorySessionsList
├─ Pass grouped terminals to component
└─ Adjust layout if needed
```

### Type Definitions

```typescript
// From story 1.1, available in src/lib/history-parser.ts

export interface GroupedSession {
  count: number
  firstTime: number
  lastTime: number
  duration: number
  lastDisplay: string
  project: string
  events: HistoryEvent[]
}

export interface TerminalCardProps {
  terminal: GroupedSession
  terminalId: string
  isExpanded: boolean
  onToggle: (id: string) => void
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}
```

---

## 🎨 Component Structure

### HistoryTerminalsList
```
<div className="space-y-2">
  {terminals.map((terminal, idx) => (
    <TerminalCard
      key={terminal.sessionId}
      terminalId={terminal.sessionId}
      terminal={terminal}
      isExpanded={expandedTerminals.has(terminal.sessionId)}
      onToggle={toggleExpand}
      isFavorite={isFavorite(terminal.sessionId)}
      onToggleFavorite={toggleFavorite}
    />
  ))}
</div>
```

### TerminalCard
```
<div className="bg-gama-surface border border-white/10 rounded-lg p-4">
  {/* Header: Clickable area */}
  <div 
    className="cursor-pointer hover:border-gama-primary/30"
    onClick={() => onToggle(terminalId)}
  >
    <div className="flex items-center gap-3">
      <span className="text-xl">📱</span>
      <div className="flex-1">
        <div className="font-semibold text-gama-primary">
          {terminal.count} messages · {formatDuration(terminal.duration)}
        </div>
        <div className="text-sm text-gama-text-secondary">
          Last: {terminal.lastDisplay.substring(0, 60)}
        </div>
        <div className="text-xs text-gama-text-secondary">
          {terminal.project}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(terminalId)
        }}
        className="text-xl"
      >
        {isFavorite ? '⭐' : '☆'}
      </button>
      <span className="text-lg text-gama-text-secondary">
        {isExpanded ? '▼' : '▶'}
      </span>
    </div>
  </div>

  {/* Messages: Expanded content */}
  {isExpanded && (
    <div className="mt-4 pt-4 border-t border-white/10">
      <ChatBubbles messages={terminal.events.map(e => e.display).join('\n')} />
    </div>
  )}
</div>
```

---

## 🔄 Implementation Checklist

### Phase 1: Create TerminalCard Component
- [ ] Create `src/components/TerminalCard.tsx`
- [ ] Props: terminal, terminalId, isExpanded, onToggle, isFavorite, onToggleFavorite
- [ ] Render terminal header with all info
- [ ] Add expand/collapse arrow
- [ ] Conditionally render messages if expanded
- [ ] Style with Gama colors

### Phase 2: Refactor HistorySessionsList → HistoryTerminalsList
- [ ] Rename/copy component to HistoryTerminalsList.tsx
- [ ] Remove message-level rendering
- [ ] Replace with terminal-level rendering (use TerminalCard)
- [ ] Update state management (expandedTerminals instead of selectedMessage)
- [ ] Update search/filters to work on terminal-level

### Phase 3: Update Historic Page
- [ ] Modify `src/app/historic/page.tsx`
- [ ] Import HistoryTerminalsList
- [ ] Fetch grouped data from `/api/history` (response now has `bySession`)
- [ ] Convert `bySession` object to array for rendering
- [ ] Pass terminals to HistoryTerminalsList

### Phase 4: Update History Storage
- [ ] Add terminal-level favorite functions to `src/lib/history-storage.ts`
- [ ] Separate from message-level favorites (different localStorage keys)

### Phase 5: Testing
- [ ] Open /historic → should show ~3-4 terminals
- [ ] Click terminal → expands to show messages
- [ ] Click again → collapses
- [ ] Favorite toggle works
- [ ] Search filters terminals
- [ ] Page reloads → expanded state persisted

---

## 🎯 Definition of Done

- [ ] `src/components/TerminalCard.tsx` created with full styling
- [ ] `src/components/HistoryTerminalsList.tsx` refactored
- [ ] `src/app/historic/page.tsx` updated to show terminals
- [ ] `/historic` page displays 3-4 terminals (not 50 items)
- [ ] Expand/collapse works smoothly
- [ ] Favorites work at terminal level
- [ ] Search works at terminal level
- [ ] TypeScript types correct
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] Git commit: "feat: refactor historic to display terminals instead of events"

---

## 📝 Notes

**Why separate localStorage for favorites?**
- User may want to favorite entire terminals (not individual messages)
- Different use case (terminal = session, message = event)
- Cleaner data model

**Migration from message to terminal favorites:**
- Old favorites (message-level) can be discarded
- Fresh start with terminal-level favorites
- No breaking changes (internal feature)

---

## ✍️ Ready for Development

@dev (Dex): Start this story after Story 1.1 API is complete. Frontend will consume grouped data from `/api/history`.
