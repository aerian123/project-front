# QA Notes: Public Welfare Service Assistant

## Scenarios & Edge Cases

- **Vague queries**: Inputs like “지원금 뭐 있어?” should trigger a friendly clarification prompt without leaving the user at a dead end.
- **No matching service**: Ensure not-found state displays recovery guidance and returns focus to the chatbot input.
- **Online-only services**: Document checklist and offline guidance panels must clearly state that in-person submission is unavailable.
- **Offline-only steps**: Verify office addresses, hours, and appointment notices surface prominently; test mobile layout for long addresses.
- **Document updates**: When a document is retired, mark it with preparation notes indicating replacements or expirations.
- **Low bandwidth / offline**: Hero imagery avoided; text guidance remains accessible even when decorative assets fail to load.
- **Keyboard navigation**: Tab order across header → accessibility controls → chatbot → categories → footer with visible focus styling.
- **High contrast mode**: Validate colour combinations meet WCAG 2.1 AA once the `high-contrast` class is toggled on the body element.
- **Text scaling**: Ensure layout reflows cleanly for large and extra text scales, especially within chatbot panels and document lists.
- **Audio summary**: Browser speech synthesis availability is optional; confirm graceful no-op when unsupported.

## Manual Regression Checklist

1. Run `npm run lint` and `npm run test` prior to QA handoff.
2. Confirm chatbot query “기초연금 신청” returns both online and offline instructions with document names.
3. Use category card “어르신 지원” → “기초연금 신청 상세 안내 보기” → detail page parity with chatbot guidance.
4. Toggle text size and high contrast, ensuring state persists while navigating between Home and Service Detail routes.
5. Execute `axe` scan (`npm run test`) and verify zero violations are reported.
