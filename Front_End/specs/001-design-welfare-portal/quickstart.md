# Quickstart Guide: Public Welfare Service Assistant Portal (React)

## Prerequisites
- Node.js 18 LTS or higher
- pnpm 8.x (preferred) or npm 10.x
- Modern browser for testing (Chrome, Edge, Safari, Firefox)

## Initial Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```
- Development server listens on `http://localhost:5173/` (Vite default).  
- Hot module replacement keeps component previews in sync with content edits.

## Project Layout
```text
frontend/
├── public/               # Static assets (favicon, manifest, civic icons)
├── src/
│   ├── components/       # Shared UI primitives (buttons, cards, banner)
│   ├── layout/           # Header, footer, grid scaffolding
│   ├── pages/
│   │   ├── Home/         # Landing page with chatbot entry + category cards
│   │   └── ServiceDetail/# Document checklist + online/offline guidance
│   ├── styles/           # CSS Modules + design tokens (sky-blue palette)
│   └── utils/            # Content loaders, accessibility helpers
└── tests/                # Jest + React Testing Library suites
```

## Recommended Development Flow
1. **Review Spec & Data Model**  
   Align content placeholders with `ServiceGuidance` and related entities.

2. **Implement Shared Styles**  
   Define palette, typography, spacing in `styles/tokens.ts` and base CSS Modules.

3. **Build Home Layout**  
   - Chatbot panel (call-to-action, input mock)  
   - Life-event category cards (responsive grid)  
   - Supporting accessibility controls (text resize toggle, contrast mode button)

4. **Create Service Detail Template**  
   Render service summary, eligibility highlights, online vs offline steps, document checklist, and support channels.

5. **Wire Static Data**  
   Provide JSON fixtures aligned with API contract for rapid UI iteration.

6. **Validate Accessibility**  
   - Keyboard navigation with focus rings  
   - Contrast checks (use tooling such as axe/Storybook if available)  
   - Screen reader labels on chatbot CTA and document download links

7. **Run Tests & Linting**
```bash
pnpm test           # Executes component/unit tests
pnpm lint           # (configure ESLint) ensures accessibility and style rules
```

## Deployment Preview
- Use `pnpm build` to create production bundle under `frontend/dist/`.
- Serve via static host (e.g., Netlify, Vercel, or government-managed CDN).  
- Confirm build output meets performance goal (<2s first meaningful paint) using Lighthouse.
