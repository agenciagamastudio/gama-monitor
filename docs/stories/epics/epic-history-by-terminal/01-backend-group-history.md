# Story 1.1: Backend - Group History by Session

**Story ID:** `EPIC-002-01`  
**Status:** Draft  
**Owner:** @dev (Dex)  
**Effort:** 1-2 hours  
**Complexity:** Medium  
**Created:** 2026-04-03

---

## 📖 User Story

> As a developer reviewing my Claude Code history,  
> I want the backend to group events by `sessionId` (terminal),  
> So that I receive organized, session-based data instead of 50 individual event records.

---

## 🎯 Description

Currently, the `/api/history` endpoint returns all raw events from `history.jsonl` with a 1:1 mapping (event = session). This creates a 50-item list when only 3-4 terminals were actually used.

**Implement session-based grouping** in the backend:
1. Parse `history.jsonl` 
2. Group all events by `sessionId` field
3. For each session, calculate: count, firstTime, lastTime, duration, lastDisplay
4. Return structured response: `{ bySession: { sessionId → grouped events } }`
5. Maintain backward compatibility

---

## ✅ Acceptance Criteria

### Data Grouping
- [ ] All events from `history.jsonl` are correctly grouped by `sessionId`
- [ ] No events are lost or duplicated
- [ ] Each session has a unique `sessionId`
- [ ] Sessions are sorted by `lastTime` (most recent first)

### Calculations
- [ ] `count`: Integer (message count in session) ✓ accurate
- [ ] `firstTime`: Timestamp of earliest event in session ✓ correct
- [ ] `lastTime`: Timestamp of latest event in session ✓ correct
- [ ] `duration`: Milliseconds (lastTime - firstTime) ✓ correct
- [ ] `lastDisplay`: Text of final message in session ✓ non-empty
- [ ] `project`: Working directory from first event ✓ preserved

### API Response
- [ ] GET `/api/history` returns: `{ bySession: { sessionId: { ... } } }`
- [ ] Response includes all original events (in `events` array)
- [ ] Response time < 500ms (even with 50+ events)
- [ ] No breaking changes to existing API contract
- [ ] Error handling: graceful if `history.jsonl` missing/empty

### Code Quality
- [ ] New utility function: `src/lib/history-parser.ts`
- [ ] Function signature: `parseHistoryBySession(events: HistoryEvent[]): SessionGroup`
- [ ] Full TypeScript types defined
- [ ] Unit-testable (no external dependencies)
- [ ] JSDoc comments on public functions

---

## 📋 Technical Details

### New Files
```
src/lib/history-parser.ts (NEW)
├─ export function parseHistoryBySession()
├─ export interface SessionGroup
├─ export interface GroupedSession
└─ export interface SessionMetadata
```

### Modified Files
```
src/app/api/history/route.ts (MODIFY)
├─ Import parseHistoryBySession
├─ Call grouping function before response
└─ Return { bySession, sessions } structure
```

### Type Definitions

```typescript
// src/lib/history-parser.ts

export interface HistoryEvent {
  display: string
  pastedContents: Record<string, unknown>
  timestamp: number
  project: string
  sessionId: string
}

export interface SessionMetadata {
  count: number
  firstTime: number
  lastTime: number
  duration: number
  lastDisplay: string
  project: string
}

export interface GroupedSession extends SessionMetadata {
  events: HistoryEvent[]
}

export interface SessionGroup {
  [sessionId: string]: GroupedSession
}

export function parseHistoryBySession(
  events: HistoryEvent[]
): SessionGroup {
  // Implementation here
}
```

---

## 📊 Test Data

**Input:** 50 events from `history.jsonl`
```json
{"display":"ola","timestamp":1771732576684,"project":"C:\\Windows\\system32","sessionId":"35651502-4c83-4235-8808-3ac2e7035aea"}
{"display":"oa","timestamp":1771732767165,"project":"C:\\Windows\\system32","sessionId":"0e12c030-fbb6-427f-894a-926d6dd02af1"}
... (48 more)
```

**Expected Output:**
```json
{
  "bySession": {
    "35651502-4c83-4235-8808-3ac2e7035aea": {
      "count": 15,
      "firstTime": 1771732576684,
      "lastTime": 1771732876000,
      "duration": 299316,
      "lastDisplay": "ola",
      "project": "C:\\Windows\\system32",
      "events": [{ ... }, { ... }]
    },
    "0e12c030-fbb6-427f-894a-926d6dd02af1": {
      "count": 12,
      "firstTime": 1771732767165,
      "lastTime": 1771733234055,
      "duration": 466890,
      "lastDisplay": "/model ",
      "project": "C:\\Windows\\system32",
      "events": [{ ... }, { ... }]
    },
    ...
  }
}
```

---

## 🔄 Implementation Checklist

### Phase 1: Create Utility Function
- [ ] Create `src/lib/history-parser.ts`
- [ ] Define TypeScript interfaces (HistoryEvent, SessionMetadata, GroupedSession, SessionGroup)
- [ ] Implement `parseHistoryBySession()` function
- [ ] Add JSDoc comments

**Pseudocode:**
```typescript
export function parseHistoryBySession(events: HistoryEvent[]): SessionGroup {
  const grouped: SessionGroup = {}
  
  for (const event of events) {
    if (!grouped[event.sessionId]) {
      grouped[event.sessionId] = {
        events: [],
        count: 0,
        firstTime: event.timestamp,
        lastTime: event.timestamp,
        lastDisplay: event.display,
        project: event.project,
        duration: 0
      }
    }
    
    grouped[event.sessionId].events.push(event)
    grouped[event.sessionId].count++
    grouped[event.sessionId].lastTime = event.timestamp
    grouped[event.sessionId].lastDisplay = event.display
    grouped[event.sessionId].duration = event.timestamp - grouped[event.sessionId].firstTime
  }
  
  return grouped
}
```

### Phase 2: Modify API Route
- [ ] Import `parseHistoryBySession` in `/api/history/route.ts`
- [ ] Call grouping function in GET handler
- [ ] Return grouped structure: `{ bySession: {...}, sessions: [...] }`
- [ ] Add error handling (missing/empty file)

### Phase 3: Validation
- [ ] Run `npm run typecheck` → zero errors
- [ ] Test API endpoint with curl: `curl http://localhost:3015/api/history`
- [ ] Verify response has `bySession` key
- [ ] Verify event count matches (50 total)
- [ ] Verify session count is ~3-4

---

## 🎯 Definition of Done

- [ ] `src/lib/history-parser.ts` created with full implementation
- [ ] `src/app/api/history/route.ts` modified to use grouping function
- [ ] `/api/history` returns `{ bySession: {...} }` structure
- [ ] All 50 events preserved (zero loss)
- [ ] TypeScript types complete and correct
- [ ] `npm run typecheck` passes (zero errors)
- [ ] API response time < 500ms
- [ ] Git commit: "feat: implement session-based grouping in history backend"

---

## 📝 Notes

**Why separate utility file?**
- Reusable function (frontend, dashboard will also need grouping logic)
- Testable in isolation
- Clear separation of concerns

**Backward compatibility:**
- Original `/api/history` response structure changed, but this is internal API
- Frontend will handle new structure (Story 1.2)
- No external consumers affected

---

## ✍️ Ready for Development

@dev (Dex): This story is ready for implementation in YOLO mode. All AC clear, implementation path defined.
