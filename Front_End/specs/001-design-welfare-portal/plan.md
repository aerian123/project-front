# Implementation Plan: Public Welfare Service Assistant Portal

**Branch**: `001-design-welfare-portal` | **Date**: 2025-10-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-design-welfare-portal/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Design the initial React homepage experience for the public welfare assistant, emphasising intuitive layouts that guide residents through chatbot-driven service discovery, alternative browsing paths, and accessible document preparation checklists aligned with civic branding.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x with React 18  
**Primary Dependencies**: React Router 6, CSS Modules with shared design tokens, React Testing Library  
**Storage**: N/A (static front-end content and client-managed state)  
**Testing**: Jest 29 + React Testing Library for UI validation  
**Target Platform**: Modern evergreen browsers (Chrome, Edge, Safari, Firefox) across desktop and mobile  
**Project Type**: Web frontend single-page application  
**Performance Goals**: First meaningful paint under 2 seconds on 4G mobile for landing view  
**Constraints**: Must satisfy Korean public-sector accessibility standards (≈ WCAG 2.1 AA), responsive layouts down to 320px width, enforce sky-blue civic palette and plain-language copy  
**Scale/Scope**: Initial release covers landing, chatbot panel, three life-event navigation cards, and representative service-detail flow with document checklist

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholders provide no binding principles or tooling mandates. Gate passed with default expectation to maintain accessibility focus from feature spec; after Phase 1 design no contradictions detected.

## Project Structure

```text
specs/001-design-welfare-portal/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md            # created later via /speckit.tasks
```

### Source Code (repository root)

```text
frontend/
├── public/
├── src/
│   ├── components/
│   ├── layout/
│   ├── pages/
│   │   ├── Home/
│   │   └── ServiceDetail/
│   ├── styles/
│   └── utils/
└── tests/
```

**Structure Decision**: Implement a single React workspace under `frontend/` with page-scoped directories for Home and Service Detail, shared civic layout primitives in `layout/`, and typography/color tokens in `styles/`. Dedicated `tests/` directory mirrors component hierarchy for Jest + RTL suites.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
