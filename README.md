# AniVerse

An anime discovery and community app built with **Next.js 15 (App Router), TypeScript, Supabase and the AniList GraphQL API**.

Discover what's trending, search thousands of anime, keep a personal watchlist with statuses and scores, write reviews, and chat with other fans in a live discussion on every anime page.

> **Live demo:** _add your Vercel link here_

---

## Features

- **Discover:** the home page shows Trending, Popular this season and All-time favourites. It is pre-rendered with **ISR** and rebuilt at most once an hour.
- **Browse and search:**
  - search by title with filters for genre, year, format and sort order
  - **infinite scroll**, and filters are kept **in the URL**, so results can be shared and the back button works
  - grid or list view, and recent searches (both remembered with **Zustand**)
- **Anime pages:**
  - banner, cover, score, genres, synopsis, characters, trailer, next episode date and recommendations
  - per-page **SEO metadata** and Open Graph images
- **Accounts:** **Supabase Auth** with email and password, email confirmation and protected routes in **middleware**.
- **Watchlist:**
  - statuses: Watching, Plan to watch, Completed, Paused, Dropped
  - personal 1–10 scores
  - **optimistic updates** with rollback if saving fails
- **Reviews:** a 1–10 rating and a written review per anime, saved with a **Server Action**. Shows the average rating from users.
- **Live discussion:** comments appear instantly for everyone through **Supabase Realtime**.
- **Public profiles** (`/u/username`): stats, the anime list and recent reviews.
- **Settings:** edit your username, display name and bio, and upload an avatar to **Supabase Storage**.
- **Responsive design** from phone to desktop, dark and light mode, and accessible components (keyboard and screen reader friendly).

## Tech stack

| Area         | Tools                                                                              |
| ------------ | ---------------------------------------------------------------------------------- |
| Framework    | Next.js 15 App Router, React 19, TypeScript (strict)                               |
| Rendering    | Server Components, ISR (`revalidate`), Server Actions, Route Handlers, Middleware  |
| Backend      | Supabase: Auth, Postgres with Row Level Security, Realtime, Storage                |
| GraphQL      | AniList GraphQL API (fragments, aliases, variables) via a small typed fetch client |
| REST         | Our own Route Handler at `/api/watchlist` (GET, POST, PATCH, DELETE)               |
| Server state | TanStack Query (infinite queries, optimistic mutations)                            |
| Client state | Zustand (with `persist`)                                                           |
| UI           | Tailwind CSS v4, shadcn/ui (Radix UI), lucide icons, sonner toasts, next-themes    |
| Forms        | React Hook Form + Zod (the same schemas validate on the client and the server)     |
| Testing      | Jest + React Testing Library (unit, component, API route), Playwright (end-to-end) |
| Tooling      | ESLint, Prettier, GitHub Actions CI                                                |

## How the pieces fit together

```
                  ┌──────────────── Next.js on Vercel ───────────────────┐
 Browser ───────▶ │ Middleware: refreshes the Supabase session,           │
                  │             protects /watchlist and /settings         │
                  │                                                       │
                  │ Server Components (ISR, cached 1h) ──GraphQL──▶ AniList
                  │ Route Handler /api/watchlist ───────────┐             │
                  │ Server Actions (reviews, profile) ──────┼──▶ Supabase │
                  └─────────────────────────────────────────┘             │
 Client Components:                                                       │
   React Query ──GraphQL──▶ AniList (search, infinite scroll)             │
   Supabase client ─────────────▶ Realtime comments, avatar uploads ◀─────┘
```

A few design decisions worth talking about:

- **Static anime pages, dynamic user content.** AniList data is rendered on the server and cached (ISR), so anime pages are fast and SEO-friendly. Anything specific to the signed-in user (list status, reviews, comments) loads in Client Components, so the page itself can stay cached for everyone.
- **Four ways to talk to the backend, each where it fits:**
  - **Server Components** read data (watchlist page, profiles).
  - A **Route Handler** gives the watchlist a REST API, used by optimistic React Query mutations.
  - **Server Actions** handle form submissions (reviews, profile).
  - The **Supabase browser client** is used where the browser needs a direct connection (Realtime, Storage uploads).
- **Security is enforced in the database.** Row Level Security policies mean users can only change their own rows, even if someone calls Supabase directly with the public key. Input is validated with Zod on both client and server.
- **Gentle on the API.** The home page fetches three lists in **one GraphQL request** using aliases. Server data is cached for an hour, and React Query caches search results in the browser.

## Project structure

```
src/
├── app/                      # Routes (App Router)
│   ├── page.tsx              # Home (ISR)
│   ├── search/               # Browse with filters + infinite scroll
│   ├── anime/[id]/           # Anime page (ISR) + review Server Actions
│   ├── watchlist/            # Signed-in user's list (Server Component)
│   ├── u/[username]/         # Public profile
│   ├── settings/             # Profile form + avatar upload, Server Actions
│   ├── login/, signup/       # Auth pages
│   ├── auth/callback/        # Email confirmation handler
│   └── api/watchlist/        # REST Route Handler (+ tests)
├── components/               # UI, grouped by feature; ui/ holds shadcn components
├── hooks/                    # React Query hooks (search, watchlist, profile)
├── lib/
│   ├── anilist/              # GraphQL client, queries, types
│   ├── supabase/             # Browser/server clients, middleware helper, DB types
│   ├── validations.ts        # Zod schemas shared by client and server
│   └── utils.ts              # Formatting helpers
├── store/                    # Zustand store
├── test/                     # Test fixtures and helpers
└── middleware.ts             # Session refresh + route protection
supabase/schema.sql           # Tables, RLS policies, trigger, realtime, storage
e2e/                          # Playwright tests
```

---

## Getting started

### 1. Requirements

- Node.js 20 or newer
- A free [Supabase](https://supabase.com) account (no credit card needed)

### 2. Install

```bash
npm install
```

### 3. Set up Supabase (about 5 minutes)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard), click **New project**, name it `aniverse`, set a database password, choose the **Mumbai (ap-south-1)** region and create it.
2. Open **SQL Editor → New query**, paste the whole of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**. This creates:
   - the tables and Row Level Security policies
   - the trigger that creates a profile on sign up
   - the realtime setup for comments
   - the `avatars` storage bucket
3. Click **Connect** at the top of the dashboard, or go to **Project Settings → API**, and copy the **Project URL** and the **anon public** key.
4. Copy `.env.example` to `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

5. **Email confirmation:** Supabase asks new users to confirm their email by default.
   - **Recommended:** go to **Authentication → URL Configuration**, set **Site URL** to `http://localhost:3000`, and add `http://localhost:3000/auth/callback` under **Redirect URLs**.
   - **For a quicker demo:** turn off **Authentication → Sign In / Providers → Email → Confirm email**.

> The anon key is meant to be public. Your data is protected by the Row Level Security policies in `schema.sql`.

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000. Browsing anime works even before Supabase is set up. Accounts, lists, reviews and comments need the keys.

## Scripts

| Command                 | What it does                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `npm run dev`           | Start the dev server                                                                 |
| `npm run build`         | Production build                                                                     |
| `npm start`             | Run the production build                                                             |
| `npm test`              | Unit, component and API tests (Jest)                                                 |
| `npm run test:coverage` | Tests with a coverage report                                                         |
| `npm run test:e2e`      | End-to-end tests (Playwright). The first time, run `npx playwright install chromium` |
| `npm run lint`          | ESLint                                                                               |
| `npm run typecheck`     | TypeScript                                                                           |
| `npm run format`        | Prettier                                                                             |

## Testing

- **Unit tests:** formatting helpers, Zod schemas, URL ↔ filter parsing, the AniList GraphQL client (errors, rate limits, network failures) and the Zustand store.
- **Component tests (React Testing Library):**
  - login and sign up forms: validation, wrong password, taken username, email confirmation and safe redirects
  - search filters: debounced URL updates, filters kept when changing another, recent searches, grid/list toggle
  - review form with the rating picker
  - the watchlist button: optimistic add and rollback on error
  - watchlist rows: status and score changes, and removing an anime
- **API route tests:** `/api/watchlist` returns 401 for signed-out users, 400 for invalid input and 404 for a missing row, and only touches the signed-in user's rows.
- **End-to-end tests (Playwright, desktop and mobile):**
  - opening an anime from the home page
  - searching with the query kept in the URL
  - being redirected to login from a protected page

## Deploying to Vercel (free)

1. Push the project to GitHub.
2. In [Vercel](https://vercel.com/new), import the repository. Next.js is detected automatically.
3. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`, set to your Vercel URL, for example `https://aniverse-prasad.vercel.app`
4. Deploy.
5. In Supabase, go to **Authentication → URL Configuration**:
   - set **Site URL** to your Vercel URL
   - add `https://your-app.vercel.app/auth/callback` to **Redirect URLs**

> Supabase pauses free projects after about a week without activity. Open the site, or the Supabase dashboard, before sharing the link.

## Credits

Anime data and images from [AniList](https://anilist.co). This project is not affiliated with AniList.
