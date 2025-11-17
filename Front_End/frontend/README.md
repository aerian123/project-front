# Public Welfare Service Assistant Frontend

React + TypeScript single-page application delivering the public welfare guidance experience. The UI focuses on a chatbot-first flow, life-event navigation, and accessibility tooling tailored for civic services.

## Getting Started

```bash
npm install
npm run dev
```

- Development server: `http://localhost:5180`
- Build for production: `npm run build`
- Static preview: `npm run preview`
- Lint & formatting checks: `npm run lint`
- Automated regression tests (Vitest + Testing Library + jest-axe): `npm run test`

## Project Structure

```
frontend/
?œâ??€ src/
??  ?œâ??€ components/               # Chatbot, category, accessibility, service UI primitives
??  ?œâ??€ data/                     # Static service/document fixtures for prototype
??  ?œâ??€ layout/                   # App shell, header/footer, accessibility context
??  ?œâ??€ pages/                    # Home (chatbot + navigation) and ServiceDetail templates
??  ?œâ??€ styles/                   # Design tokens + global styles (sky-blue civic palette)
??  ?œâ??€ types/                    # Service/document/support channel domain models
??  ?”â??€ utils/                    # Search helpers mapping user queries to guidance content
?œâ??€ tests/                        # Vitest suites (chatbot flows, navigation, accessibility)
?”â??€ vite.config.ts                # Vite + Vitest configuration
```

## Core User Journeys

1. **Chatbot-Guided Complaint Preparation**
   - `HomePage` renders chatbot input and response components.
   - Query string matched via `searchServices` util ??detailed guidance with online/offline steps and document checklist.

2. **Life-Event Navigation**
   - `CategoryGrid` displays cards for senior support, childcare, and disability programs.
   - `ServiceSummaryCard` links to `ServiceDetailPage`, which mirrors chatbot guidance with eligibility, steps, documents, and support channels.

3. **Accessible Public Experience**
   - `AccessibilityControls` provide text-scale, high-contrast, and audio summary toggles.
   - Global styles standardize focus outlines and responsive typography; high-contrast theme applied via body class.
   - `jest-axe` regression tests guard against accessibility regressions.

## Runbook & Preview Checklist

1. `npm install`
2. `npm run lint` ??ensure no ESLint violations (jsx-a11y included)
3. `npm run test` ??executes chatbot/navigation UX tests and axe audits
4. `npm run dev` ??manual QA on:
   - Chatbot query returning online/offline steps + document checklist
   - Category card navigation and detail page parity
   - Text size & high-contrast toggles; keyboard traversal through header/nav/controls
   - Audio summary button (if browser speech synthesis available)

## Notes

- Static guidance data seeded in `src/data/serviceGuidance.ts` for prototyping; replace with API integration in future phases.
- Audio summary uses Web Speech API when available; fails silently in unsupported environments.
- Engine requirements: Node.js ??18 (tested with Vite 5, React 18).

