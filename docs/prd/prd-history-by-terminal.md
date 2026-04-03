# PRD: History by Terminal (Session-based Grouping)

**Version:** 1.0  
**Status:** Draft  
**Created:** 2026-04-03  
**Owner:** @pm (Morgan)  
**Epic Reference:** `epic-history-by-terminal`

---

## 🎯 Problem Statement

### Current State
- Users have ~3-4 active Claude Code terminals per day
- System logs all CLI inputs/outputs to `~/.claude/history.jsonl` (~50 events per day)
- **Historic page shows 50 separate "sessions"** (one per event)
- **Reality:** These 50 events belong to only ~3-4 distinct terminals/sessions
- **UX Impact:** Cluttered list, user confusion, impossible to see "which terminal did what"

### Root Cause
- `history.jsonl` has granular events grouped by timestamp, not by `sessionId`
- Backend `/api/history` treats each line as separate session
- Frontend displays 1-to-1 mapping (event = session item)

### User Pain Point
> "I opened only 3-4 terminals but it shows 50 sessions. I want to see my terminals, not 50 individual messages."

---

## ✅ Solution Overview

### What We're Building
**Session-based grouping of History:**
- Parse `history.jsonl` and group events by `sessionId` (UUID field in each event)
- For each session, calculate:
  - **Count:** Total messages in session
  - **Duration:** Time from first to last message
  - **FirstTime / LastTime:** Timestamps
  - **LastDisplay:** Most recent message text
  - **Project:** Working directory/project

### User Experience After
```
📱 Terminal 1
   15 messages | 4 hours | Last: "ola" @ 14:30 | ~/GAMA_MONITOR

📱 Terminal 2  
   12 messages | 2 hours | Last: "/logout" @ 16:45 | ~/Desktop

📱 Terminal 3
   10 messages | 30 min | Last: "daw" @ 11:20 | ~/

📱 Terminal 4
   13 messages | 1 hour | Last: "awdaw" @ 12:15 | ~/GAMA_AIOS
```

Click terminal → expand to see all messages in that session

---

## 🎯 Success Metrics

1. **Clarity:** Reduce visual clutter from 50 items → 3-4 items
2. **Accuracy:** Each terminal shows correct message count ±1
3. **Performance:** `/api/history` grouping completes in <500ms
4. **Coverage:** 100% of events grouped correctly by sessionId
5. **UX:** Users can expand/collapse terminals, see duration at a glance

---

## 📋 Acceptance Criteria

### Backend (API)
- [ ] `/api/history` returns grouped structure: `{ bySession: { sessionId: { count, firstTime, lastTime, lastDisplay, events[] } } }`
- [ ] Each session includes all original event data
- [ ] Timestamps are accurate (first event = firstTime, last event = lastTime)
- [ ] Duration calculated in milliseconds (lastTime - firstTime)

### Frontend (Historic Page)
- [ ] Render list of terminals (not events)
- [ ] Each terminal shows: icon + count + duration + last message + project
- [ ] Click to expand/collapse terminal's messages
- [ ] Search filters terminals (by content/project)
- [ ] Favorites toggle works at terminal level

### Dashboard
- [ ] Sessions counted correctly (3-4 not 50)
- [ ] Heatmap shows terminal activity (not message activity)
- [ ] Top agents/projects aggregated per terminal
- [ ] Insights reference "3 terminals" not "50 messages"

### Data Integrity
- [ ] Zero message loss (all 50 events preserved)
- [ ] sessionId grouping 100% accurate
- [ ] Backward compatible with existing API consumers

---

## 📊 Feature Scope

### In Scope ✅
- Parse history.jsonl and group by sessionId
- Backend API returns grouped data
- Frontend displays terminals as primary entity
- Dashboard metrics recalculated by terminal
- Favorites/search refactored for terminal-level

### Out of Scope ❌
- Terminal naming/labeling (future feature)
- Session persistence across system restarts (already in .jsonl)
- Real-time session updates (history is append-only)
- Export by terminal (future feature)

---

## 🏗️ Technical Architecture

### Data Flow
```
history.jsonl (50 raw events)
    ↓
parseHistoryBySession() [new utility]
    ↓
{ bySession: { sessionId → grouped events } }
    ↓
/api/history returns structured data
    ↓
Frontend renders terminals
    ↓
Dashboard aggregates by terminal
```

### New Files/Changes
- **New:** `src/lib/history-parser.ts` → Add `parseHistoryBySession()` function
- **Modify:** `src/app/api/history/route.ts` → Return grouped structure
- **Modify:** `src/components/HistorySessionsList.tsx` → Become `HistoryTerminalsList`
- **Modify:** `src/lib/dashboard-stats.ts` → Recalculate metrics by terminal
- **Modify:** Historic page layout

### No Database Changes
- Using existing `history.jsonl` (append-only, local storage)

---

## 📈 Implementation Plan

| Phase | Owner | Effort | Duration |
|-------|-------|--------|----------|
| Phase 1: Backend grouping | @dev | 1-2h | 90min |
| Phase 2: Frontend terminals list | @dev | 1-2h | 90min |
| Phase 3: Dashboard refactor | @dev | 1-1.5h | 60min |
| Phase 4: QA & integration test | @qa | 30-45min | 45min |
| **Total** | — | **3-5.5h** | **~4h** |

---

## 🎯 Definition of Done (DoD)

- [ ] All 4 stories marked "Done"
- [ ] Zero TypeScript errors (`npm run typecheck` ✅)
- [ ] Build successful (`npm run build` ✅)
- [ ] Dashboard shows 3-4 terminals (not 50)
- [ ] All messages preserved (zero data loss)
- [ ] Git commit with proper message
- [ ] User can explain new feature without prompting

---

## 🔄 Dependencies & Assumptions

### Dependencies
- None (data already exists in `history.jsonl`)

### Assumptions
- `sessionId` field is always present in history.jsonl ✅ (verified)
- Users want terminal-level grouping (verified with user) ✅
- Backward compatibility not critical (internal feature) ✅

---

## 📝 Notes

**Why Now?**
- User explicitly requested this during Historic v2 demo
- System counting is confusing (50 vs reality of 3-4)
- Will improve onboarding/explanation

**Post-Launch Considerations**
- Future: Terminal labeling (e.g., "GAMA_MONITOR dev")
- Future: Session-based export
- Future: Per-terminal bookmarks

---

## ✍️ Sign-Off

**@pm (Morgan):** Ready to proceed with epic creation  
**@user (Orion):** Approved ✅
