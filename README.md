# Receipts

Points app for group trips: log points with photo evidence, vote entries through, and watch a live leaderboard. iOS and Android from one Expo codebase, with Supabase as the backend.

- [PLAN.md](PLAN.md): MVP scope, decisions, data model, milestones
- [concepts.html](concepts.html): design concepts

## Setup

Needs Node 22+. Create `.env` in the project root (it's git-ignored):

```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
supabasedbpw=<database password, used only by the scripts below, never bundled into the app>
```

In the Supabase dashboard, turn on **Authentication → Sign In / Providers → Allow anonymous sign-ins**.

```
npm install
npm run db:migrate     # apply supabase/migrations to the database
npm run db:test        # check voting, PIN and permission rules (rolls back, leaves no data)
```

## Run on your phone

1. Install **Expo Go** from the App Store or Play Store.
2. `npm start` (loads `.env`, including `EXPO_TOKEN` for your Expo login)
3. Scan the QR code (iPhone: Camera app, Android: Expo Go). Phone and computer must be on the same Wi-Fi; if that doesn't work, use `npm run tunnel`.

## Checks

```
npm run check      # typecheck, lint, unit and component tests
npm run db:test    # database rules
```
