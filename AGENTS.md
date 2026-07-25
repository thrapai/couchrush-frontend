# AGENTS.md

## UI principles

- Use Material UI v9 and the shared `@couchrush/theme`.
- Do not introduce Tailwind or a second styling system.
- Do not recreate colours, typography, spacing, radii, or shadows inside apps.
- Use Bungee only for display headings, scores, and major game moments.
- Use Inter for body text, forms, tables, menus, and controls.
- All user-facing text must use shared i18n translation keys; never hard-code UI copy in components. Add both English and Greek translations for every new key.

## Components

- Prefer existing shared components before creating new ones.
- Use MUI components and `sx`; avoid large custom CSS files.
- Keep components small, reusable, typed, and accessible.
- Use icons from `@mui/icons-material`.
- Do not place backend calls directly inside presentation components.

## Responsive design

- Design mobile-first and support widths down to 320px.
- Use touch targets of at least 44–46px.
- Avoid horizontal scrolling unless the content genuinely requires it.
- Test dark and light modes.
- Test loading, empty, error, disabled, hover, and focus states.

## Data and permissions

- Use Axios through the shared API client.
- Use TanStack Query for REST server state.
- Do not fetch server data manually with `useEffect`.
- Use permission checks, not hard-coded role checks.
- Frontend permission hiding is UX only; backend authorisation remains authoritative.
- Never invent API fields, endpoints, permissions, or analytics. Inspect `../couchrush-backend/docs`.

## Realtime

- Keep Socket.IO logic outside UI components.
- Treat realtime client state as a rendering cache.
- The server remains authoritative for scores, timers, answers, transitions, and eligibility.

## Quality

- Keep UI text clear and concise.
- Add accessible labels and keyboard support.
- Reuse existing query keys, hooks, and layout patterns.
- Run lint, typecheck, tests, and build before finishing.
- Run `pnpm deadcode` before finishing. Do not suppress Knip findings without confirming they are intentional framework, generated-code, or dynamic-entry exceptions.
