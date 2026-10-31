# Receipts (working name; repo: pointTracker)

Points app for group trips (Expo SDK 58 + Supabase). Scope and milestones: [PLAN.md](PLAN.md). Expo-specific guidance: [AGENTS.md](AGENTS.md) (Expo changes every SDK, so check versioned docs, don't rely on memory).

## Product direction

The first users are one bachelor trip, but the goal is a **public App Store and Play Store release**, marketed as **Receipts**, for any group trip: bachelor and bachelorette parties, birthdays, ski trips, festivals. Groups make their own rules, and much later can pick from curated preset rule packs. Build every feature as if strangers will use it at scale:

- **No single-trip shortcuts.** Everything is scoped per trip, nothing is hard-coded to one group, and "bachelor" or "groom" never becomes a core assumption. The groom is a trip-specific role, to generalise later as "guest of honour".
- **Rules stay per trip.** Presets are copied into a trip at creation, so future rule packs plug into the same model.
- **Scale by default.** Index every query path by trip, paginate lists that grow (feed, comments), compress media on the device, and avoid one-query-per-row patterns.
- **Public release requirements** need room in the design even before they're built:
  - reporting and blocking for user-generated photos and comments (an App Store rule for apps with user content);
  - in-app account and data deletion;
  - a privacy policy;
  - age rating for drinking-themed content.
- User-facing copy says **Receipts**.

## Codebase rules

1. **Self-documenting code.** Names and structure explain what the code does. Comments only explain what the code can't: a non-obvious reason, a platform quirk, a security constraint. No comments that restate the code, no section-banner comments.
2. **No Claude attribution in commits or PR descriptions.** No `Co-Authored-By: Claude` trailer, no "Generated with Claude Code" line.
3. **Modular, with a clean frontend/backend split.**
   - `supabase/` is the backend: migrations, database tests, database scripts. Game rules and permissions live here.
   - `src/` is the frontend. Only `src/api/` talks to Supabase; screens and components never call `supabase` directly.
   - Route files in `src/app/` stay thin: they compose components and hooks. Reusable UI goes in `src/components/`, shared logic in `src/hooks/`, `src/session/` and `src/utils/`.
   - One component or concern per file.
4. **Fix bugs as a class.** When a problem turns up, find every place in the app where the same kind of problem can occur and fix them all, ideally by moving the fix into a shared component, hook or database function so it can't come back. Then add the rule to this file if it's a convention.

## Testing

Nothing ships without tests, and every bug fix starts with a test that reproduces it. Three layers, matched to where the logic lives:

1. **Database tests**: `npm run db:test` (`supabase/tests/`). The game rules (voting, PINs, permissions, limits) are enforced in SQL, so they're tested there, against the dev project, inside a transaction that's rolled back. Every new migration needs tests here.
2. **Unit and component tests**: `npm test`, using Jest (`jest-expo`) and React Native Testing Library v14. In v14, `render`, `renderHook`, `fireEvent` and `act` are async, so always `await` them.
   - Tests live in `__tests__/` folders next to the code they test, **never inside `src/app/`**, where expo-router would turn them into routes. Route screens are tested from `src/__tests__/`.
   - Mock the `src/api/*` module a component uses, not Supabase itself.
   - `src/__tests__/conventions.test.ts` enforces the rules in this file. When a new rule can be checked mechanically, add it there.
3. **End-to-end tests**: Maestro flows in `.maestro/`, from milestone 7 when there are real builds (it can't drive Expo Go). They run on an Android emulator or EAS Workflows. Playwright isn't used because the app is native-only.

`npm run check` (typecheck, lint, unit tests) and `npm run db:test` must pass before a change is done.

## Frontend layout

```
src/app/          routes only (expo-router)
src/api/          Supabase client, encrypted session storage, typed calls per domain, query registry, realtime
src/session/      which trip/player this phone is, cached on the device
src/hooks/        shared screen logic (async actions, trip queries, live updates, voting)
src/components/   UI building blocks; feature-specific parts in subfolders (join/, create-trip/)
src/constants/    theme tokens and shared styles
src/utils/        pure helpers
src/test-utils/   test helpers and fixtures (not tests themselves)
```

## UI conventions

- **Every screen's outer container is `<Screen>`** (`src/components/screen.tsx`), including error and placeholder screens. Never use a bare `ScrollView`, `View` or `SafeAreaView` as the outer container. `Screen` gives:
  - room to scroll the last item clear of the tab bar and home indicator, plus `ScreenBottomSpace`;
  - safe-area insets on both platforms;
  - focused inputs scrolled above the keyboard, and drag-to-dismiss for the keyboard.
- **Point steppers follow the number line.** `+` always moves toward positive (−5 → −4), and a penalty stays negative. Steppers work on the signed value, never on the magnitude.
- **Number-pad inputs must close the keyboard themselves**, because the iPhone number pad has no Done key. Use `PinField`; any other numeric input closes the keyboard once its value is complete.
- **Busy and error state for user actions** goes through `useAsyncAction`.
- **Reading trip data:** every list is declared once in `src/api/trip-queries.ts` (name, fetch function, the live tables that refresh it) and read with `useTripQuery(tripQueries.x)`. TanStack Query caches it, so screens and the tab badge share one copy. Never fetch in a component with `useEffect`.
- **Your own actions show instantly.** Never make the screen wait on a refetch after a write:
  - Where the result is predictable (votes, a new rule), apply it to the cache first with `useOptimisticTripUpdate`, and undo it if the server refuses. Predictions use the same pure functions that mirror the SQL (`withMyVote`).
  - Then invalidate the affected queries with `useInvalidateTripQueries`, without `await`, so the server's version replaces the guess. Live updates do the same for other phones.
- **Lists never jump.**
  - Rows in lists that change while you watch (feed cards, leaderboard rows, rules) are wrapped in `AnimatedListItem`, so they fade and slide.
  - An item the user just acted on stays where it is until they leave the screen or pull to refresh (`useKeptWhileFocused`), even if the server now files it elsewhere.
- **Queries scoped to one thing in a trip** (a player's entries) take a param: `useTripQuery(tripQueries.playerEntries, playerId)`. Invalidating or optimistically updating the query covers every param.
- **Live updates** (`useTripLiveUpdates`, mounted once in the trip layout) refetch everything when Supabase reports the change feed is live. Changes made while connecting or offline are never delivered, so don't remove that.
- **Rules about who can act** (who may vote, and so on) are decided by the database. The app mirrors them in pure functions (`src/utils/voting.ts`), checked in the same order as the SQL, so it never offers an action the database would refuse.
- Colors, spacing and radii come from `src/constants/theme.ts` ("Receipts" look from concepts.html), never hard-coded. Points are shown with `formatPoints` (real minus sign).
- The app is light-only (`userInterfaceStyle: "light"`).

## Data and security

- Clients only read, and only rows for trips their device is linked to (RLS). Every write goes through a `SECURITY DEFINER` function in `supabase/migrations`. Never add client write policies.
- Schema changes go in a new numbered migration file. Run `npm run db:migrate`, then `npm run db:test`, and add tests for new rules.
- New functions get `revoke ... from public, anon` and an explicit `grant execute ... to authenticated`, as in `0001_core.sql`.
- Error messages raised in SQL are shown to users as-is, so write them as plain sentences.

## Secrets

`.env` is git-ignored and holds the Supabase URL, the anon key, `supabasedbpw` (database scripts only) and `EXPO_TOKEN` (Expo login). Only `EXPO_PUBLIC_*` values may be used in app code. Never print `.env` values; show key names only.

## Commands

- `npm start` runs the dev server. It loads `.env` first so `EXPO_TOKEN` is picked up. Use `npm run tunnel` if the phone can't reach the PC.
- `npm run check` runs typecheck, lint and unit tests. `npm run test:watch` while working.
- `npm run db:migrate`, `npm run db:test`, `npm run db:status`.
