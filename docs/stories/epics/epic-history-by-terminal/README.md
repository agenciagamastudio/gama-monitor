# Epic: History by Terminal (Session-based Grouping)

**Epic ID:** `EPIC-002`  
**Status:** Draft (Stories Created)  
**Created:** 2026-04-03  
**Expected Completion:** 2026-04-04

---

## 📁 Documents in this Epic

1. **[EPIC.md](./EPIC.md)** — High-level epic overview, dependencies, timeline
2. **[../prd/prd-history-by-terminal.md](../prd/prd-history-by-terminal.md)** — Product Requirements Document
3. **[01-backend-group-history.md](./01-backend-group-history.md)** — Story 1.1: Backend
4. **[02-frontend-terminals-list.md](./02-frontend-terminals-list.md)** — Story 1.2: Frontend
5. **[03-dashboard-by-terminal.md](./03-dashboard-by-terminal.md)** — Story 1.3: Dashboard
6. **[04-qa-integration-test.md](./04-qa-integration-test.md)** — Story 1.4: QA

---

## 🎯 What This Epic Solves

### The Problem
User opened only 3-4 Claude Code terminals today, but the History page showed **50 sessions**.

**Why?** Each keystroke/message was counted as a separate "session" instead of being grouped by terminal.

### The Solution
Group all events by their `sessionId` (terminal ID) so users see:
- **Before:** 50 items (overwhelming)
- **After:** 3-4 items (clear)

---

## 🔄 AIOS Workflow This Epic Demonstrates

This epic follows the **complete AIOS flow**:

```
PRD (Product Requirements)
  ↓
EPIC (High-level Feature)
  ↓
4 STORIES (Detailed Tasks)
  ├─ Story 1: Backend Implementation
  ├─ Story 2: Frontend Implementation
  ├─ Story 3: Dashboard Implementation
  └─ Story 4: QA & Validation
  ↓
Implementation (@dev)
  ├─ Implement Story 1
  ├─ Implement Story 2
  ├─ Implement Story 3
  └─ Implement Story 4
  ↓
QA Gate (@qa)
  ├─ Review & Test
  └─ Approve or Reject
  ↓
Push to Production (@devops)
```

---

## ⚠️ Why the System Should Work Like This By Default

### The Issue: Current System
You've been doing features **ad-hoc** (YOLO mode):
1. Write code directly
2. No formal PRD
3. No epic specification
4. No stories with AC
5. No validation gate
6. Just commit + push

**Result:** ✅ Fast, ❌ fragile, ❌ hard to understand later

### The Better Way: AIOS Flow
1. Write PRD (why, what, success criteria)
2. Create Epic (scope, timeline, dependencies)
3. Write Stories (detailed AC, implementation guide)
4. Validate Stories (10-point checklist)
5. Implement (clear acceptance criteria)
6. QA Gate (independent review)
7. Push (only when fully validated)

**Result:** ✅ Slower upfront, ✅ robust, ✅ easy to understand & maintain, ✅ reusable

---

## 🤔 Why This Isn't Default in Claude Code

**Reasons:**

1. **Speed Bias:** Claude Code optimizes for rapid prototyping
   - `npm run dev` faster than PRD writing
   - Direct implementation faster than planning
   - Works for 1-person projects (you)

2. **Overhead:** PRD + Epic + Stories = 2-3 hours per feature
   - 10-minute feature takes 2+ hours to document
   - Feels wasteful for small changes
   - Discourages use of formal flow

3. **Friction:** Structure requires discipline
   - Easy to skip (no enforcement)
   - Easy to do wrong (template confusion)
   - Easy to abandon halfway

4. **Learning Curve:** Requires understanding AIOS, Stories, AC
   - Not obvious how to write good AC
   - Not obvious how to scope stories
   - Takes practice

---

## ✅ Why YOU Should Use This Flow (Going Forward)

### For This Project
1. **Complexity Growing:** ~3-4 features per week now
2. **Maintenance Cost:** Easier to understand later with PRD
3. **Onboarding:** If someone else joins, PRD explains everything
4. **Debugging:** AC makes it clear what was intended vs what broke

### For Future Projects
1. **Reusability:** Stories can be copied to other projects
2. **Parallelization:** Multiple devs can work on different stories
3. **Quality:** QA gate catches issues before production
4. **Handoff:** Easy to hand off mid-feature (has PRD + stories)

---

## 🚀 How to Use This Epic

### For @dev (Implementation)
1. Read [01-backend-group-history.md](./01-backend-group-history.md)
2. Implement all AC
3. Verify: `npm run typecheck` + `npm run build`
4. Commit with message: `feat: implement story 1.1`
5. Move to Story 1.2

### For @qa (Validation)
1. Read [04-qa-integration-test.md](./04-qa-integration-test.md)
2. Run all test scenarios
3. Document results in test matrix
4. Sign off "PASS" or list blockers

### For Future Maintainers
1. Read [../prd/prd-history-by-terminal.md](../prd/prd-history-by-terminal.md) — understand WHY
2. Read [EPIC.md](./EPIC.md) — understand SCOPE
3. Read relevant Story — understand HOW
4. Modify with confidence (AC guides you)

---

## 📊 Metrics

| Metric | Value |
|--------|-------|
| Total Effort | 3-5.5 hours |
| Number of Stories | 4 |
| Estimated Completion | 2026-04-04 |
| Risk Level | Low |
| Complexity | Medium |
| Impact | High (improves UX clarity) |

---

## 🎓 What You'll Learn From This Epic

1. **How AIOS Workflow Really Works**
   - PRD → Epic → Stories → Dev → QA → Deploy
   - Why each step exists

2. **How to Write Good AC (Acceptance Criteria)**
   - Testable and specific
   - Covers happy path + edge cases
   - Guides implementation

3. **How to Structure Stories**
   - Clear description
   - Detailed technical path
   - Implementation checklist

4. **How to Estimate Effort**
   - Why each story is 1-2 hours (not vague)
   - How to break down features

5. **Why This Matters for Future**
   - Easier to debug problems
   - Easier to scale (multiple devs)
   - Easier to maintain (clear intent)

---

## 🔗 Next Steps

1. **Now:** You're reading this ✅
2. **Next:** @dev starts Story 1.1 (Backend)
3. **Then:** Stories 1.2, 1.3 (Frontend, Dashboard)
4. **Finally:** @qa runs Story 1.4 (Integration tests)

---

## ✍️ Notes

**Why show this flow?**
- You asked: "pq o sistema ja não trabalha assim em default"
- Answer: Speed vs Structure tradeoff
- Solution: You just saw the structured way
- Next time: You can decide: YOLO or AIOS flow

**Implementation Recommendation:**
- Use AIOS flow for: Features (>2 hours), Refactors, Cross-component changes
- Use YOLO for: Hotfixes, One-liners, Single-file tweaks

**Your Choice:**
- YOLO: Fast, risky, good for learning
- AIOS: Slow, safe, good for scale

You're at inflection point. Choose accordingly.

---

**Created by @pm (Morgan)** — Product Management  
**AIOS Framework v2.0**
