---

description: "Task list for Public Welfare Service Assistant Portal implementation"
---

# Delivery Roadmap: Public Welfare Service Assistant Portal

**Input**: `/specs/001-design-welfare-portal/` design set  
**Prerequisites**: `plan.md`, updated `spec.md`, `research.md`, `data-model.md`, `contracts/`  
**Testing Guidance**: Pair component delivery with React Testing Library coverage and targeted accessibility checks (`jest-axe`) when it increases confidence.

## How to Read This Document
- Tasks are grouped by delivery milestone; each milestone aligns with a user story or shared infrastructure.
- Columns: `Status` (`[X]` complete, `[ ]` open), `ID`, `Story` (US1–US3 or shared), `Description` with file-level focus.
- Milestone checkpoints signal when dependent work may begin.

## Milestone Breakdown

### Phase 1 — Setup (Shared Infrastructure)
| Status | ID   | Story | Description |
|--------|------|-------|-------------|
| [X]    | T001 | —     | Scaffold Vite + React + TypeScript workspace under `frontend/` per implementation plan. |
| [X]    | T002 | —     | Add React Router 6, React Testing Library, pnpm scripts in `frontend/package.json`. |
| [X]    | T003 | —     | Configure ESLint (with `eslint-plugin-jsx-a11y`) and Prettier via `frontend/.eslintrc.cjs` and `frontend/.prettierrc`. |
| [X]    | T004 | —     | Establish design tokens and global styles in `frontend/src/styles/tokens.ts` and `frontend/src/styles/global.css`. |

**Checkpoint**: Tooling and global styling ready for feature work.

### Phase 2 — Foundational (Blocking Prerequisites)
| Status | ID   | Story | Description |
|--------|------|-------|-------------|
| [X]    | T005 | —     | Initialize router shell and app bootstrap in `frontend/src/main.tsx` and `frontend/src/App.tsx`. |
| [X]    | T006 | —     | Build shared layout primitives (Header, Footer, Grid) in `frontend/src/layout/`. |
| [X]    | T007 | —     | Define ServiceGuidance domain types in `frontend/src/types/guidance.ts`. |
| [X]    | T008 | —     | Create static content fixtures for services/documents/categories in `frontend/src/data/serviceGuidance.ts`. |
| [X]    | T009 | —     | Implement guidance search selectors in `frontend/src/utils/guidanceSearch.ts`. |
| [X]    | T010 | —     | Prepare Home and Service Detail page shells under `frontend/src/pages/`. |

**Checkpoint**: Foundation is complete—user stories may proceed in parallel.

### Phase 3 — User Story 1 · Chatbot-Guided Complaint Preparation (P1 · MVP)
| Status | ID   | Story | Description |
|--------|------|-------|-------------|
| [X]    | T011 | US1   | Add chatbot search experience test in `frontend/tests/pages/HomePage.chatbot.test.tsx`. |
| [X]    | T012 | US1   | Implement chatbot input and prompt helper in `frontend/src/components/chatbot/ChatbotInput.tsx`. |
| [X]    | T013 | US1   | Render chatbot guidance results with online/offline sections in `frontend/src/components/chatbot/ChatbotGuidance.tsx`. |
| [X]    | T014 | US1   | Connect chatbot state to guidance search on `frontend/src/pages/Home/HomePage.tsx`. |
| [X]    | T015 | US1   | Style chatbot panel with accessible sky-blue treatment in `frontend/src/pages/Home/HomePage.module.css`. |

**Checkpoint**: Chatbot journey delivers channel-specific guidance and passes independent test.

### Phase 4 — User Story 2 · Life-Event Exploration (P2)
| Status | ID   | Story | Description |
|--------|------|-------|-------------|
| [X]    | T016 | US2   | Implement category grid and cards in `frontend/src/components/category/CategoryGrid.tsx`. |
| [X]    | T017 | US2   | Build service summary card list component in `frontend/src/components/service/ServiceSummaryCard.tsx`. |
| [X]    | T018 | US2   | Integrate category navigation section on `frontend/src/pages/Home/HomePage.tsx`. |
| [X]    | T019 | US2   | Complete service detail content (summary, steps, documents, support) in `frontend/src/pages/ServiceDetail/ServiceDetailPage.tsx`. |
| [X]    | T020 | US2   | Add navigation flow test covering category-to-detail journey in `frontend/tests/pages/HomePage.navigation.test.tsx`. |

**Checkpoint**: Browse experience mirrors chatbot guidance; both journeys operate independently.

### Phase 5 — User Story 3 · Accessible Civic Experience (P3)
| Status | ID   | Story | Description |
|--------|------|-------|-------------|
| [X]    | T021 | US3   | Implement accessibility controls (text size, contrast) in `frontend/src/components/accessibility/AccessibilityControls.tsx`. |
| [X]    | T022 | US3   | Apply accessibility state and landmarks within `frontend/src/layout/AppLayout.tsx`. |
| [X]    | T023 | US3   | Update global styles for focus outlines and responsive typography in `frontend/src/styles/global.css`. |
| [X]    | T024 | US3   | Add accessibility regression test with `jest-axe` in `frontend/tests/accessibility/a11y.test.tsx`. |
| [X]    | T025 | US3   | Provide audio summary trigger component in `frontend/src/components/accessibility/AudioSummaryButton.tsx`. |

**Checkpoint**: Accessibility requirements satisfied; controls persist across journeys.

### Phase 6 — Polish & Cross-Cutting
| Status | ID   | Story | Description |
|--------|------|-------|-------------|
| [X]    | T026 | —     | Document runbook and UI overview in `frontend/README.md`. |
| [X]    | T027 | —     | Capture edge-case QA notes in `frontend/docs/qa-notes.md`. |
| [X]    | T028 | —     | Record lint/test/Lighthouse verification results in `frontend/docs/verification.md`. |

**Checkpoint**: Repository ready for handoff with supporting QA artifacts.

## Dependency Map
- Phase 1 → prerequisite for every subsequent phase.
- Phase 2 → blocks user story work; complete before starting Phases 3–5.
- Phases 3–5 → may proceed concurrently after Phase 2 if coordination ownership is defined.
- Phase 6 → begins after target user stories reach their checkpoints.

### Within Each User Story
1. Draft or adjust targeted tests.
2. Build supporting components.
3. Integrate with relevant pages/routes.
4. Apply styling and accessibility updates.
5. Run story-specific verification before moving on.

## Parallel Execution Guidance
- After T001 closes, T002–T004 can run in parallel.
- In Phase 2, T006–T009 touch distinct directories and may proceed concurrently once routing shell (T005) exists.
- Testing tasks (T011, T020, T024) run alongside implementation to maintain coverage momentum.
- Phase 6 tasks T027 and T028 may run in parallel once documentation (T026) sets context.

## Implementation Strategy
1. **MVP First (US1)** — deliver chatbot guidance with accurate document checklists.
2. **Expand Navigation (US2)** — unlock life-event exploration as a non-chatbot path.
3. **Accessibility Enhancements (US3)** — layer adaptive controls and verification.
4. **Polish & Verification** — finalize documentation, QA records, and release evidence.
