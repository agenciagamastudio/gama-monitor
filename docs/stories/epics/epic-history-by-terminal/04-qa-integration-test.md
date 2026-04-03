# Story 1.4: QA - Integration Test

**Story ID:** `EPIC-002-04`  
**Status:** Draft  
**Owner:** @qa (Quinn)  
**Effort:** 30-45 minutes  
**Complexity:** Low  
**Depends on:** Stories 1.1, 1.2, 1.3 ✅  
**Created:** 2026-04-03

---

## 📖 User Story

> As a QA tester,  
> I want to verify the entire history-by-terminal feature works end-to-end,  
> So that users get an accurate, seamless experience from backend to dashboard.

---

## 🎯 Description

Validate the complete integration of session-based history grouping:
- Backend grouping logic is correct
- Frontend displays terminals properly
- Dashboard metrics reflect terminal count
- No data loss
- No regressions in existing features

---

## ✅ Acceptance Criteria

### Data Integrity
- [ ] All 50 events from `history.jsonl` are preserved (zero loss)
- [ ] No duplicate events in grouped output
- [ ] All 3-4 unique sessionIds accounted for
- [ ] Event timestamps preserved exactly
- [ ] Project/directory data intact

### Backend API (`/api/history`)
- [ ] GET request returns 200 OK
- [ ] Response has `bySession` key
- [ ] `bySession` contains 3-4 sessions (not 50)
- [ ] Each session has: `count`, `firstTime`, `lastTime`, `duration`, `lastDisplay`, `project`, `events[]`
- [ ] `count` matches actual message count in session
- [ ] `firstTime` < `lastTime`
- [ ] `duration` = `lastTime` - `firstTime`
- [ ] `events[]` array contains all original event data
- [ ] Response time < 500ms

### Frontend Historic Page
- [ ] Navigate to `/historic` loads successfully
- [ ] Page displays 3-4 terminal cards (not 50 items)
- [ ] Each terminal card shows:
  - [ ] Message count (e.g., "15 messages")
  - [ ] Duration (e.g., "4 hours 5 minutes")
  - [ ] Last message preview
  - [ ] Project directory
  - [ ] Timestamp
  - [ ] Favorite toggle (⭐ / ☆)
  - [ ] Expand/collapse arrow
- [ ] Click terminal → expands to show messages ✓
- [ ] Click again → collapses ✓
- [ ] Favorite toggle works ✓
- [ ] Search filters terminals ✓
- [ ] Page layout responsive on mobile

### Dashboard (`/historic/dashboard`)
- [ ] Dashboard loads successfully
- [ ] Overview Cards show:
  - [ ] "Total Sessions": 3-4 (not 50) ✓
  - [ ] "This Period": 3-4 (not 50) ✓
  - [ ] "Avg Words": reasonable number ✓
  - [ ] "Top Agent": correct agent name ✓
- [ ] Activity Heatmap:
  - [ ] Shows 12 weeks correctly
  - [ ] Intensity based on terminal count (0-4) ✓
  - [ ] Hover tooltip accurate
  - [ ] Summary stats (total, days active, best day) correct
- [ ] Agent Chart:
  - [ ] Top agents displayed correctly
  - [ ] Count reflects unique terminals (not message count)
  - [ ] Percentages add up to ~100%
- [ ] Project Chart:
  - [ ] Top projects displayed correctly
  - [ ] Same criteria as agents
- [ ] Trends Chart:
  - [ ] Y-axis shows terminal count per week (not message count)
  - [ ] Peaks/valleys match actual terminal activity
  - [ ] Weekly stats below chart accurate
- [ ] Smart Insights:
  - [ ] Reference "terminals" (not "messages")
  - [ ] Numbers match dashboard data
  - [ ] Growth metrics accurate

### No Regressions
- [ ] Favorites still work (terminal-level now)
- [ ] Search still works
- [ ] Period selector works (7d/30d/90d/all)
- [ ] Export functions work (or gracefully handled)
- [ ] No console errors in browser DevTools
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)

### Code Quality
- [ ] All files compile without warnings
- [ ] No unused imports
- [ ] No commented-out code
- [ ] TypeScript strict mode passes
- [ ] Git history is clean (1 commit per story)

---

## 🔄 Testing Checklist

### Pre-Test Setup
- [ ] All 3 development stories (1.1, 1.2, 1.3) are merged
- [ ] Latest code pulled: `git pull`
- [ ] Dependencies installed: `npm install`
- [ ] Dev server running: `npm run dev`
- [ ] Browser: http://localhost:3015

### Test 1: API Response
```bash
# Terminal 1
curl http://localhost:3015/api/history | jq '.bySession | keys'
# Expected: ["sessionId1", "sessionId2", "sessionId3", "sessionId4"]

curl http://localhost:3015/api/history | jq '.bySession | length'
# Expected: 3 or 4
```

### Test 2: Historic Page
```
1. Open http://localhost:3015/historic
2. Count visible terminal cards: should be 3-4 (not 50)
3. Check first terminal card:
   ✓ Shows message count (e.g., "15 messages")
   ✓ Shows duration (e.g., "4 hours")
   ✓ Shows last message
   ✓ Shows project
   ✓ Has expand arrow (▶)
4. Click terminal card:
   ✓ Arrow changes to (▼)
   ✓ Messages expand below
   ✓ ChatBubbles render correctly
5. Click again:
   ✓ Collapses
   ✓ Arrow returns to (▶)
6. Try search:
   ✓ Filter works
   ✓ Terminals matching search highlighted
7. Try favorite toggle:
   ✓ Clicking ⭐ favorites/unfavorites terminal
```

### Test 3: Dashboard
```
1. Open http://localhost:3015/historic/dashboard
2. Check Overview Cards:
   ✓ "Total Sessions" shows 3-4 (not 50)
   ✓ "This Period Sessions" shows 3-4
   ✓ "Avg Words" shows reasonable number
   ✓ "Top Agent" shows correct agent
3. Check Activity Heatmap:
   ✓ Grid displays (12 weeks x 7 days)
   ✓ Colors vary (0-4 intensity)
   ✓ Hover tooltip shows terminal count
4. Check Charts:
   ✓ Agent bar chart displays
   ✓ Project bar chart displays
   ✓ Percentages make sense
5. Check Trends:
   ✓ Line chart displays
   ✓ Y-axis shows reasonable numbers (3-4 range, not 50)
   ✓ Weekly stats accurate
6. Check Insights:
   ✓ Insights reference "terminals" not "messages"
   ✓ Numbers match dashboard data
7. Try Period Selector:
   ✓ Change to "7d" → metrics update
   ✓ Change to "30d" → metrics update
   ✓ Change to "90d" → metrics update
   ✓ Change to "all" → metrics update
```

### Test 4: Console & Build
```bash
# Terminal 2
npm run typecheck
# Expected: zero errors

npm run build
# Expected: SUCCESS

# Browser Console (F12)
# Expected: zero errors, only normal warnings
```

### Test 5: Data Preservation
```bash
# Verify no events lost
curl http://localhost:3015/api/history | jq '[.bySession[].count] | add'
# Expected: 50 (total message count across all terminals)
```

---

## 📊 Test Results Template

| Test | Result | Notes |
|------|--------|-------|
| API returns 3-4 sessions | ✅ / ❌ | |
| Historic shows 3-4 terminals | ✅ / ❌ | |
| Terminal expand/collapse works | ✅ / ❌ | |
| Dashboard shows 3-4 sessions | ✅ / ❌ | |
| Dashboard metrics accurate | ✅ / ❌ | |
| No console errors | ✅ / ❌ | |
| No TypeScript errors | ✅ / ❌ | |
| Build succeeds | ✅ / ❌ | |
| Zero message loss | ✅ / ❌ | |

---

## 🔴 Failure Scenarios

If any test fails:

1. **API returns wrong count:**
   - Check `history-parser.ts` grouping logic
   - Verify sessionId field exists in all events
   - Debug: log grouped output

2. **Historic shows 50 items:**
   - Check HistoryTerminalsList is receiving grouped data
   - Verify terminal cards are rendering (not event items)
   - Debug: log props passed to component

3. **Dashboard shows 50 sessions:**
   - Check dashboard-stats.ts refactoring
   - Verify `terminals.length` not `messages.length`
   - Debug: log terminal array size

4. **Data loss (count != 50):**
   - Critical issue
   - Review parseHistoryBySession() logic
   - Verify no events filtered out

---

## 🎯 Definition of Done

- [ ] All 5 test sections completed with ✅
- [ ] Test results documented (timestamp, notes)
- [ ] Zero regressions in existing features
- [ ] Zero console errors
- [ ] TypeScript check passes
- [ ] Build succeeds
- [ ] User can walk through feature without issues
- [ ] QA sign-off: "PASS" or "FAIL with notes"
- [ ] Git commit: "test: verify history-by-terminal integration"

---

## 📝 Notes

**Expected Data After Tests:**
- 3-4 unique terminals visible
- ~50 total messages across all terminals
- Metrics (agents, projects) matching terminal-level usage
- Dashboard showing single-digit session count

**If Data Changes:**
- Remember: each test run adds new events to history.jsonl
- Delete old history for clean testing: `rm ~/.claude/history.jsonl` (careful!)
- Or use subset of test data

---

## ✍️ Ready for QA

@qa (Quinn): This story is the final validation gate. Run all tests and document results.
