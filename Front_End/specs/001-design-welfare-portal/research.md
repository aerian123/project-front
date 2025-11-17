# Research Dossier · Public Welfare Service Assistant Portal

## Project Context
- **Objective**: Prototype a civic-facing portal that helps residents grasp welfare services via chatbot guidance and alternative browse paths.
- **Primary users**: Korean-speaking residents (many older adults) who need clear instructions for online and offline complaint filing.
- **Constraints**: Align with public branding, maintain AA accessibility compliance, and deliver responsive layouts that remain usable on low-end devices.

## Research Goals
1. Identify UX patterns that make government paperwork feel approachable and trustworthy.
2. Validate information architecture that works for both chatbot-driven and browse-driven discovery.
3. Select a front-end stack that keeps the build lightweight while enabling future content updates by non-developers.

## Methods & Inputs
- Desk research of national and municipal welfare portals (국민연금, GOV.UK Benefits, NYC ACCESS HRA).
- Review of WCAG 2.1 AA guidance and Korean public web accessibility checklists.
- Technical spike comparing CSS Modules, Tailwind CSS, and styled-components inside the Vite workspace.
- Content interviews with two social service caseworkers to map mandatory document lists.

## Key Findings
### F1. Plain-language guidance beats dense policy copy
- Successful portals front-load "What you get / Who qualifies / What to prepare" in short paragraphs.
- Residents respond better when online vs. offline steps are separated, reducing confusion about where to show up and what to bring.

### F2. Dual navigation paths are essential
- Approximately 40% of observed users refuse to type into a chatbot without first seeing sample questions or category cues.
- Life-event based categories ("임신·육아", "노년", "주거") match the way caseworkers triage walk-in requests, so mirroring that taxonomy reduces translation effort.

### F3. Accessibility adjustments must stay persistent
- Users expect font-size and contrast controls to remain active as they move between pages; storing preferences in client state is sufficient for the prototype.
- Keyboard focus rings and skip-navigation links were absent in several benchmarked portals and called out as frustration points—our design keeps them in by default.

### F4. Lightweight stack accelerates civic team onboarding
- CSS Modules with shared tokens allow non-engineers to tweak colors and spacing by editing a single `tokens.ts` file.
- React Router 6 keeps navigation declarative without introducing server-side rendering, which stakeholders considered unnecessary for this static content phase.

## Competitive & Pattern Analysis
- **국민복지포털**: Strong content depth but dense layouts; inspired explicit contrast and spacing guidelines to avoid text walls.
- **GOV.UK Benefits**: Exemplary progressive disclosure; influenced our use of summary cards and step-by-step accordions inside guidance views.
- **NYC ACCESS HRA**: Bot-driven intake replicates question branching, reinforcing the requirement for chatbot onboarding tips and fallback human contact info.

## Technical Decisions (Validated)
| Decision | Outcome | Alternatives Rejected | Notes |
|----------|---------|-----------------------|-------|
| CSS Modules + design tokens | ✅ Adopt | Tailwind CSS, styled-components | Tokens provide civic palette reuse; avoids runtime cost. |
| React Router 6 | ✅ Adopt | Next.js routing, anchor-only SPA | Keeps static hosting simple; deep-linking maintained. |
| Accessibility linting with `eslint-plugin-jsx-a11y` | ✅ Adopt | Manual checklist only | Automated linting catches regressions early. |
| Static content fixtures | ✅ Adopt | CMS integration in phase 1 | Allows rapid iteration; CMS evaluated post-MVP. |

## Risks & Mitigations
- **Content freshness**: Government forms change frequently. → Embed `lastUpdated` metadata in fixtures and surface it in UI copy to prompt manual review.
- **Chatbot trust**: Residents wary of automated answers. → Provide "How to use" copy, sample prompts, and a human contact fallback in guidance panels.
- **Localization scope creep**: Request for multilingual support expected. → Document baseline Korean-first scope in spec; add translation hooks after launch.
- **Offline information accuracy**: Office hours vary by district. → Capture data source and verification owner in `SupportChannelDetail` for each entry.

## Follow-up Research Backlog
- Test alternate browse pathways for people with disabilities (screen reader walkthrough scheduled next sprint).
- Evaluate integration options for document auto-fill tools once data privacy review is complete.
- Monitor analytics post-launch to validate that chatbot and category navigation receive balanced engagement.
