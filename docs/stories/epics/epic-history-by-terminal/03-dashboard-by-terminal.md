# Story 1.3: Dashboard - Recalculate Metrics by Terminal

**Story ID:** `EPIC-002-03`  
**Status:** Draft  
**Owner:** @dev (Dex)  
**Effort:** 1-1.5 hours  
**Complexity:** Medium  
**Depends on:** Story 1.1 ✅  
**Created:** 2026-04-03

---

## 📖 User Story

> As a user viewing the dashboard statistics,  
> I want metrics to reflect my actual usage (3-4 terminals),  
> So that insights are accurate and meaningful (not 50 messages / 1 terminal distortion).

---

## 🎯 Description

Update `/historic/dashboard` metrics to count **terminals** instead of **messages**.

**Current Problem:**
- Dashboard shows: "50 sessions", "Top agent: All agents equally"
- Reality: 3-4 terminals, unbalanced usage

**After Fix:**
- Dashboard shows: "3-4 terminals", correct agent/project distribution
- Heatmap shows terminal activity (not message activity)
- Insights reference "3 terminals" not "50 messages"

---

## ✅ Acceptance Criteria

### Overall Sessions Count
- [ ] `/historic/dashboard` displays 3-4 "Total Sessions" (not 50)
- [ ] Period filter (7d/30d/90d) counts unique terminals (not messages)

### Overview Cards
- [ ] "Total Sessions" → Count unique terminals ✓ accurate
- [ ] "This Period Sessions" → Count terminals in period ✓ accurate
- [ ] "Avg Words/Msg" → Avg across all messages in period ✓ kept as-is
- [ ] "Top Agent" → Most active agent across terminals ✓ correct

### Activity Heatmap
- [ ] Each day shows count of **active terminals** (not message count)
- [ ] If 3 terminals had messages today → show "3" (not 15+)
- [ ] Intensity scale adjusts accordingly (0-4 based on terminal count, not message count)
- [ ] Hover tooltip: "3 terminals active"

### Charts: Top Agents/Projects
- [ ] Agents counted per terminal (not per message)
- [ ] If Terminal 1 mentions agent A 10 times → count as 1 (terminal used A)
- [ ] If Terminal 2 also mentions agent A → count as 2 total (2 terminals used A)
- [ ] Projects counted the same way (per terminal, not per mention)

### Trends: Weekly
- [ ] X-axis: Week dates
- [ ] Y-axis: **Count of unique terminals per week** (not message count)
- [ ] If 3 terminals active in week 1 → show "3"
- [ ] If 2 terminals active in week 2 → show "2"

### Smart Insights
- [ ] Insights reference terminal count ("3 terminals used")
- [ ] Growth metrics: "Terminal usage up 50%" (not message count)
- [ ] Peak: "Peak day: Monday (3 terminals active)"
- [ ] Trend: "Steady usage across X terminals"

---

## 📋 Technical Details

### Files to Modify

```
src/lib/dashboard-stats.ts (MODIFY ALL FUNCTIONS)
├─ filterByPeriod() - Now filters terminals, not messages
├─ groupByWeek() - Week counts terminals, not messages
├─ topAgents() - Agents per terminal (unique terminals using agent)
├─ topProjects() - Projects per terminal (unique terminals using project)
├─ calcAvgWordCount() - Keep as-is (avg across messages)
├─ calcTopAgent() - Agent used by most terminals
├─ buildHeatmapData() - Terminals per day, not messages per day
├─ generateInsights() - Reference terminals, not messages
└─ Add: parseHistoryBySession() import from history-parser.ts
```

### New Types

```typescript
// Add to src/lib/dashboard-stats.ts

export interface TerminalActivity {
  sessionId: string
  agents: Set<string>
  projects: Set<string>
  messageCount: number
  firstTime: number
  lastTime: number
  dayOfActivity: string[] // ["2026-04-03", "2026-04-04"]
}

export interface TerminalMetrics {
  totalTerminals: number
  terminalsByPeriod: TerminalActivity[]
  terminalsByDay: Record<string, string[]> // date → [sessionId]
}
```

### Core Logic Changes

**Old:** Count all messages in period
```typescript
filtered.length // 50 messages
```

**New:** Count unique terminals in period
```typescript
const terminals = new Set(messages.map(m => m.sessionId))
terminals.size // 3-4 terminals
```

**Old:** Top agents = message frequency
```typescript
messages.filter(m => m.agent === 'dev').length // 15 msgs
```

**New:** Top agents = terminal frequency
```typescript
const terminalsByAgent = new Set(
  messages
    .filter(m => m.agent === 'dev')
    .map(m => m.sessionId)
)
terminalsByAgent.size // 2 terminals
```

---

## 🔄 Implementation Checklist

### Phase 1: Update Data Structures
- [ ] Add TerminalActivity and TerminalMetrics interfaces
- [ ] Import `parseHistoryBySession()` from history-parser.ts
- [ ] Create helper function: `getTerminalsByPeriod(sessions, period)`

### Phase 2: Update Core Functions

#### filterByPeriod()
```typescript
export function filterByPeriod(
  sessions: Record<string, GroupedSession>,
  period: PeriodType
): TerminalActivity[] {
  // Convert sessions to terminal activity array
  // Filter by period
  // Return unique terminals in period
}
```

#### groupByWeek()
```typescript
export function groupByWeek(
  terminals: TerminalActivity[]
): { week: string; count: number; avgWords: number }[] {
  // Group terminals by week
  // count = unique terminals per week (not message count)
  // avgWords = kept as-is (avg across all messages)
}
```

#### topAgents()
```typescript
export function topAgents(
  terminals: TerminalActivity[],
  n: number
): { name: string; count: number; pct: number }[] {
  // For each agent:
  //   count = number of UNIQUE TERMINALS that mention agent
  //   pct = count / total terminals * 100
}
```

#### topProjects()
```typescript
export function topProjects(
  terminals: TerminalActivity[],
  n: number
): { name: string; count: number; pct: number }[] {
  // Same as topAgents but for projects
}
```

#### buildHeatmapData()
```typescript
export function buildHeatmapData(
  terminals: TerminalActivity[]
): { date: string; count: number; intensity: 0 | 1 | 2 | 3 | 4 }[] {
  // For each day:
  //   count = UNIQUE terminals active that day (not messages)
  //   intensity = scale based on terminal count
  //     0 = 0 terminals
  //     1 = 1 terminal
  //     2 = 2 terminals
  //     3 = 3 terminals
  //     4 = 4+ terminals
}
```

#### generateInsights()
```typescript
export function generateInsights(
  terminals: TerminalActivity[],
  period: PeriodType,
  allTerminals: TerminalActivity[]
): Insight[] {
  // Generate insights referencing terminals, not messages
  // Examples:
  //   "3 terminals active today (+50% vs yesterday)"
  //   "Most active terminal: Terminal A (project GAMA_MONITOR)"
  //   "Steady usage across 3 terminals"
}
```

### Phase 3: Update Dashboard Components
- [ ] No component changes needed (they already map over metrics)
- [ ] Just verify metrics are correct

### Phase 4: Testing
- [ ] Dashboard "Total Sessions" shows ~3-4 (not 50)
- [ ] Charts show correct agent/project counts
- [ ] Heatmap intensity based on terminal count
- [ ] Insights reference terminals
- [ ] Period filter works correctly

---

## 🎯 Definition of Done

- [ ] All functions in `src/lib/dashboard-stats.ts` refactored to count terminals
- [ ] Interfaces added for TerminalActivity and TerminalMetrics
- [ ] Dashboard displays 3-4 terminals (not 50)
- [ ] All metrics reflect terminal-based counting
- [ ] TypeScript types correct
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] Dashboard numbers look reasonable (verified manually)
- [ ] Git commit: "feat: refactor dashboard metrics to count terminals not messages"

---

## 📝 Implementation Guide

### Step 1: Understand Terminal Grouping
```typescript
// Input: history.jsonl with 50 raw events
// After parsing (Story 1.1): GroupedSession[] with ~3-4 items

sessions = {
  "sessionId1": { count: 15, events: [...] },
  "sessionId2": { count: 12, events: [...] },
  "sessionId3": { count: 10, events: [...] },
  "sessionId4": { count: 13, events: [...] }
}
```

### Step 2: Convert to TerminalActivity
```typescript
const terminals: TerminalActivity[] = Object.entries(sessions).map(
  ([sessionId, session]) => ({
    sessionId,
    agents: new Set(session.events.map(e => e.agent)),
    projects: new Set(session.events.map(e => e.project)),
    messageCount: session.count,
    firstTime: session.firstTime,
    lastTime: session.lastTime,
    dayOfActivity: getDays(session.firstTime, session.lastTime)
  })
)
```

### Step 3: Use in Metrics
```typescript
// Old way (WRONG)
const total = messages.length // 50

// New way (CORRECT)
const total = terminals.length // 3-4
```

---

## ✍️ Notes

**Why terminal-based instead of message-based?**
- User has 3-4 terminals but sends 50+ messages
- Terminal = work session, message = individual command
- Terminal-level metrics more meaningful
- Reduces noise, improves clarity

---

## ✍️ Ready for Development

@dev (Dex): Complete Story 1.1 first (API returns grouped data), then tackle this.
