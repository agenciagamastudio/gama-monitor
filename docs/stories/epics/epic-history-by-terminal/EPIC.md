# EPIC: History by Terminal (Session-based Grouping)

**Epic ID:** `EPIC-002`  
**Status:** Draft  
**Created:** 2026-04-03  
**Target Completion:** 2026-04-04  
**Priority:** Medium  
**Effort:** 3-5.5 hours

---

## 🎯 Epic Summary

Refactor GAMA Monitor's History system to group events by **terminal/session** instead of individual messages.

**Current:** 50 messages displayed as 50 separate "sessions"  
**After:** 3-4 terminals displayed, each with message count + duration

---

## 📋 Acceptance Criteria

### Epic-Level AC
- [ ] History page displays terminals (not individual messages)
- [ ] Dashboard shows 3-4 terminals (not 50 sessions)
- [ ] Each terminal shows: count, duration, last message, project
- [ ] All 50 events preserved (zero data loss)
- [ ] Zero TypeScript errors + successful build
- [ ] User confirms "this is what I wanted"

### Stories Completed
- [ ] Story 1.1: Backend - Parse and group by sessionId
- [ ] Story 1.2: Frontend - Display terminals list
- [ ] Story 1.3: Dashboard - Recalculate metrics by terminal
- [ ] Story 1.4: QA - Integration testing

---

## 📚 Related Documents

**PRD:** `docs/prd/prd-history-by-terminal.md`  
**Dependent Epics:** None  
**Blocks:** None (enhancement only)

---

## 🗂️ Child Stories

### Story 1.1: Backend - Group History by Session
**File:** `01-backend-group-history.md`  
**Owner:** @dev  
**Effort:** 1-2h  
**Description:** Parse `history.jsonl`, group by `sessionId`, return grouped structure from `/api/history`

### Story 1.2: Frontend - Display Terminals List  
**File:** `02-frontend-terminals-list.md`  
**Owner:** @dev  
**Effort:** 1-2h  
**Description:** Refactor `HistorySessionsList` → `HistoryTerminalsList`, render terminals with expand/collapse

### Story 1.3: Dashboard - Recalculate by Terminal
**File:** `03-dashboard-by-terminal.md`  
**Owner:** @dev  
**Effort:** 1-1.5h  
**Description:** Update `dashboard-stats.ts` metrics to aggregate by terminal, not message

### Story 1.4: QA - Integration Test
**File:** `04-qa-integration-test.md`  
**Owner:** @qa  
**Effort:** 30-45min  
**Description:** Verify end-to-end: backend → frontend → dashboard, data integrity

---

## 📈 Timeline

```
Draft PRD ........................ ✅ 2026-04-03 (now)
Review & Approve ................ 2026-04-03 (30min)
Stories Created ................. 2026-04-03 (30min)
──────────────────────────────────────────────────────
Story 1.1 (Backend) ............. 2026-04-03 (90min)
Story 1.2 (Frontend) ............ 2026-04-03 (90min)
Story 1.3 (Dashboard) ........... 2026-04-04 (60min)
Story 1.4 (QA) .................. 2026-04-04 (45min)
──────────────────────────────────────────────────────
Total Epic Duration ............. ~5 hours
```

---

## 🔄 Workflow

1. **@pm (Morgan):** Create PRD ✅ + Epic ✅ (you are here)
2. **@sm (River):** Create 4 Stories + update story files
3. **@po (Pax):** Validate stories (10-point checklist)
4. **@dev (Dex):** Implement each story in sequence
5. **@qa (Quinn):** Review final integration
6. **@devops (Gage):** Push to master

---

## 🎯 Definition of Done (Epic-Level)

- [ ] All 4 child stories completed and marked "Done"
- [ ] Zero TypeScript/build errors
- [ ] Dashboard shows correct terminal count
- [ ] All history.jsonl events preserved
- [ ] User accepts implementation
- [ ] Epic marked "Done" + git commit

---

## 📊 Success Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Items in history list | 50 | 3-4 | 3-4 ✅ |
| Sessions in dashboard | 50 | 3-4 | 3-4 ✅ |
| Data loss | — | 0 | 0 ✅ |
| TypeScript errors | 0 | 0 | 0 ✅ |
| Build time | ~20s | ~20s | <25s ✅ |

---

## 📝 Implementation Notes

**Architecture Decision:**
- Use existing `sessionId` from history.jsonl (no schema changes)
- Group in-memory (no database changes)
- Maintain backward compatibility of API (extend, not break)

**Complexity Assessment:**
- **Scope:** Medium (refactor existing feature)
- **Risk:** Low (no schema/data changes)
- **Effort:** 3-5.5 hours
- **Difficulty:** 3/5 (straightforward grouping logic)

---

## ✍️ Next Steps

1. **Now:** @pm sends this Epic to @sm for story creation
2. **Story Creation:** @sm drafts 4 stories with detailed AC
3. **Validation:** @po reviews stories (10-point checklist)
4. **Execution:** @dev implements stories sequentially
5. **QA:** @qa tests integration
6. **Deploy:** @devops merges to master

---

**@pm (Morgan):** Epic ready for story creation by @sm ✅
