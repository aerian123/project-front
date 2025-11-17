# Product Specification · Public Welfare Service Assistant Portal

**Feature Branch**: `001-design-welfare-portal`  
**Created**: 2025-10-28  
**Last Updated**: 2025-10-28 (refactored)  
**Status**: Draft  
**Source Brief**: "누구나 이용할 수 있는 공공복지 서비스 홈페이지를 만들거야. 사용자가 챗봇으로 민원을 검색하면 온라인/오프라인으로 어떻게 서류를 준비해야되는지 하나하나 알려주는 도우미 서비스인데 누구나 사용하는 서비스여서 직관적으로 알기쉽게 홈페이지가 구성이 되어있어야 돼. ui/ux는 공공의 느낌으로 해주고 메인컬러는 하늘색으로 해줘."

## Overview
- Deliver a trustworthy civic portal that translates complex welfare services into step-by-step guidance.
- Provide equal support for chatbot-led discovery and browse-led exploration so residents can choose their preferred path.
- Embed accessibility controls and civic branding from the start to satisfy AA requirements and public expectations.

## Experience Pillars
1. **Guided Chatbot Assistance (P1)**: The quickest route to answers; optimized for residents who know their intent.
2. **Life-Event Browsing (P2)**: Category navigation that mirrors caseworker triage and builds confidence for hesitant chatbot users.
3. **Inclusive Civic UI (P3)**: Accessibility controls, plain language, and a sky-blue public-service aesthetic that signal trustworthiness.

## User Journeys & Validation
### Journey 1 — Chatbot-Guided Complaint Preparation (Priority P1)
- **Narrative**: A citizen enters a natural-language query (e.g., "기초연금 신청") and receives structured guidance separating online vs. offline preparation, complete with document checklists.
- **Why it matters**: Delivers the core value proposition—reducing stress in preparing mandatory paperwork.
- **Independent Validation**: Moderated usability study where participants start on the landing page, submit a query, and obtain channel-specific instructions without help.
- **Acceptance**:
  1. Querying "기초연금 신청" surfaces a service summary plus online submission actions, including required forms and digital checkpoints.
  2. Requesting offline guidance for the same query provides branch locations, office hours, and physical documents to bring.

### Journey 2 — Explore Services by Life Situation (Priority P2)
- **Narrative**: A visitor who does not know service names navigates via life events (임신·육아, 노년, 주거 등) to open the same detailed guidance delivered by the chatbot.
- **Why it matters**: Supports residents who avoid chatbot interactions and investors evaluating broader adoption.
- **Independent Validation**: Ask testers to locate instructions for a predefined scenario using only the browse interface; success indicates parity with chatbot experience.
- **Acceptance**:
  1. Selecting a life-event category reveals relevant service cards and access to detailed guidance mirroring chatbot output, including checklists and steps.

### Journey 3 — Accessible Public-Facing Experience (Priority P3)
- **Narrative**: An older adult increases text size, toggles high contrast, and still understands the instructions while keyboard navigating the portal.
- **Why it matters**: Without inclusive design, the primary audience may abandon the experience or fail compliance audits.
- **Independent Validation**: Accessibility review verifying readability controls, keyboard flows, and audio summary interaction operate without training.
- **Acceptance**:
  1. All interactive elements receive visible focus and can be activated via keyboard.
  2. When text size or contrast is adjusted, chatbot guidance remains legible and maintains accessible color contrast within the sky-blue palette.

### Edge Cases & Exception Handling
- Vague/multi-topic queries (e.g., "지원금 뭐 있어?") trigger clarifying prompts rather than dead ends.
- Services without offline offices clearly state online-only availability and offer alternate contact suggestions.
- Government-issued forms that change must be flagged with "outdated" notices until refreshed content ships.
- Low-bandwidth/mobile access degrades gracefully, keeping instructions readable even if media assets fail.

## Functional Requirements
### Chatbot & Guidance Delivery
- **FR-001**: Homepage features a prominent chatbot entry panel with guidance text inviting natural-language questions.
- **FR-002**: Responses summarise identified services, highlight eligibility, and separate online vs. offline sections.
- **FR-003**: Online instructions outline step-by-step actions, including pre-registration and digital submission checks.
- **FR-004**: Offline guidance covers office locations, hours, queue expectations, and documents to bring.
- **FR-005**: Document checklist indicates item name, issuing agency, format availability (digital/physical), validity, and fees.

### Navigation & Content Access
- **FR-006**: Category-based navigation (life events, demographics) routes to the same guidance without chatbot use.
- **FR-007**: Users can download, print, or save forms and instructions; when offline-only, the UI states how to obtain them.
- **FR-008**: Support channel information (call center, municipal offices) is visible within guidance detail views.

### Accessibility & Civic Experience
- **FR-009**: Accessibility controls allow text resizing, high-contrast theme, and optional audio summary trigger.
- **FR-010**: Keyboard navigation and focus styles persist across layout components and embedded panels.
- **FR-011**: Visual design applies the defined sky-blue civic palette, public-service typography, and consistent iconography.

## Non-Functional & Compliance Requirements
- **NFR-001**: Must uphold WCAG 2.1 AA criteria for contrast, keyboard access, alternative text, and skip navigation.
- **NFR-002**: Landing view achieves first meaningful paint under 2 seconds on 4G Android reference device.
- **NFR-003**: Layout supports responsive breakpoints down to 320px width without horizontal scrolling.
- **NFR-004**: Client-side preferences for accessibility controls persist during navigation within the SPA session.

## Data & Content Model
- **ServiceGuidance**: Title, beneficiary summary, service overview, online steps, offline steps, document checklist, support channels, lastUpdated metadata.
- **DocumentRequirement**: Name, issuing authority, purpose, availability (downloadable/physical), fee, validity period, preparation notes.
- **SupportChannelDetail**: Channel type (portal, call center, municipal office), contact info, operating hours, prerequisites, data owner.

## Tech Stack Overview
- **Framework**: React 18 with Vite tooling for fast static builds and modern JSX transforms.
- **Language**: TypeScript 5.x for typed service guidance models and safer refactoring.
- **Styling**: CSS Modules backed by shared civic design tokens (`frontend/src/styles/tokens.ts`) to keep palette and spacing consistent.
- **Routing**: React Router 6 for declarative route definitions (`/` landing, `/services/:slug` detail) without SSR overhead.
- **State & Utilities**: Local component state plus selector utilities in `frontend/src/utils/guidanceSearch.ts` for deterministic guidance lookup.
- **Testing**: Jest 29 with React Testing Library and `jest-axe` for accessibility regressions.
- **Build & Scripts**: pnpm workbench with linting via ESLint (`eslint-plugin-jsx-a11y`) and formatting through Prettier.

## Success Metrics
- **SM-001**: 90% of moderated testers locate complete instructions for a predefined service inside two chatbot interactions.
- **SM-002**: Top 20 services ship with fully populated document checklists validated by subject-matter reviewers.
- **SM-003**: Average time to understand required documents stays under three minutes for first-time visitors.
- **SM-004**: Accessibility audit logs zero critical issues before go-live and during soft launch.

## Assumptions & Dependencies
- Government subject-matter experts maintain document lists, office locations, and process details for priority services.
- Korean-language content is in scope for MVP; additional locales will be scoped separately.
- Chatbot leverages an existing knowledge base or content workflow to keep answers current without resident logins.
- Public authority visual guidelines permit the proposed palette and typography choices.
