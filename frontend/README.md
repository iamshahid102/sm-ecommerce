# SM Store frontend

Next.js 16 App Router storefront and admin UI.

```bash
cp .env.example .env.local
npm install
npm run dev
```

The app runs at http://localhost:3000 and expects the API at
`NEXT_PUBLIC_API_URL` (default `http://localhost:4000/api/v1`).

- `app/` — routes, root layout, Tailwind theme
- `components/ui/` — shadcn/ui primitives
- `lib/supabase/` — browser, server, and proxy Supabase clients
- `proxy.js` — refreshes the Supabase session (Next.js 16 renamed middleware)

See the root [`README.md`](../README.md) and
[`docs/DECISIONS.md`](../docs/DECISIONS.md) for architecture, environment
variables, and security rules.
