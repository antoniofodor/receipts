# Receipts (working name; repo: pointTracker)

Points app for group trips (Expo SDK 58 + Supabase). Scope and milestones: [PLAN.md](PLAN.md). Expo-specific guidance: [AGENTS.md](AGENTS.md) (Expo changes every SDK, so check versioned docs, don't rely on memory).

## Product direction

The first users are one bachelor trip, but the goal is a **public App Store and Play Store release**, marketed as **Receipts**, for any group trip: bachelor and bachelorette parties, birthdays, ski trips, festivals. Groups make their own rules, and much later can pick from curated preset rule packs. Build every feature as if strangers will use it at scale:

- **No single-trip shortcuts.** Everything is scoped per trip, nothing is hard-coded to one group, and "bachelor" or "groom" never becomes a core assumption. The groom is a trip-specific role, to generalise later as "guest of honour".
- **Rules stay per trip.** Rule packs (`rule_packs`, a server-side catalog) are copied into a trip, at creation or later, never linked, so editing a pack never changes a trip's rulebook. New packs are a migration, not an app release.
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

`npm run check` (typecheck, lint, Prettier formatting, unit tests) and `npm run db:test` must pass before a change is done.

## Frontend layout

```
src/app/          routes only (expo-router)
src/api/          Supabase client, encrypted session storage, typed calls per domain, query registry, realtime
src/session/      which trip/player this phone is, cached on the device
src/light-mode/   day or night (useLightMode, useGround) and the phone's saved preference
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
  - the whole focused field scrolled clear of the keyboard (`useFocusedInputAboveKeyboard`), and drag-to-dismiss for the keyboard. Text inputs go through `TextField`, which asks the screen to do this; never use a bare `TextInput`.
- **Point steppers follow the number line.** `+` always moves toward positive (−5 → −4), and a penalty stays negative. Steppers work on the signed value, never on the magnitude.
- **An entry counts its rule's points**, with no per-entry adjustment (`create_entry` takes no points since `0010`). To log a different amount, pick or create a different rule.
- **Inputs that reformat what's typed** (the trip code) hide the input's own text and draw the cleaned value, because the phone shows the raw keystroke before `onChangeText` can change it.
- **Number-pad inputs must close the keyboard themselves**, because the iPhone number pad has no Done key. Use `PinField`; any other numeric input closes the keyboard once its value is complete.
- **Busy and error state for user actions** goes through `useAsyncAction`.
- **Reading trip data:** every list is declared once in `src/api/trip-queries.ts` (name, fetch function, the live tables that refresh it) and read with `useTripQuery(tripQueries.x)`. TanStack Query caches it, so screens and the tab badge share one copy. Never fetch in a component with `useEffect`.
- **Your own actions show instantly.** Never make the screen wait on a refetch after a write:
  - Where the result is predictable (votes, a new rule), apply it to the cache first with `useOptimisticTripUpdate`, and undo it if the server refuses. Predictions use the same pure functions that mirror the SQL (`withMyVote`).
  - Then invalidate the affected queries with `useInvalidateTripQueries`, without `await`, so the server's version replaces the guess. Live updates do the same for other phones.
- **Lists never jump.**
  - Rows in lists that change while you watch (feed cards, leaderboard rows, rules) are wrapped in `AnimatedListItem`, so they fade and slide.
  - A view that draws a box around `AnimatedListItem` rows must be its own stacking context (`collapsable={false}`, as `Card` is). Otherwise Fabric hoists the rows out of it and measures them against the screen, so anything above moving the box makes every row spring after it, outside the box.
  - An item the user just acted on stays where it is until they leave the screen or pull to refresh (`useKeptWhileFocused`), even if the server now files it elsewhere.
- **Queries scoped to one thing in a trip** (a player's entries) take a param: `useTripQuery(tripQueries.playerEntries, playerId)`. Invalidating or optimistically updating the query covers every param.
- **Live updates** (`useTripLiveUpdates`, mounted once in the trip layout) refetch everything when Supabase reports the change feed is live. Changes made while connecting or offline are never delivered, so don't remove that.
- **Rules about who can act** (who may vote, and so on) are decided by the database. The app mirrors them in pure functions (`src/utils/voting.ts`), checked in the same order as the SQL, so it never offers an action the database would refuse.
- **Photos**:
  - Picked and compressed on the phone by `usePhotoPicker` (longest edge 1600px, JPEG).
  - Uploaded by `createEntry` before the entry is saved; `create_entry` checks each file really is in storage.
  - Shown through `EntryPhotos`, which caches by storage path because the signed links change on every fetch.
  - **Profile photos** are cropped square and kept to 512px (`takeProfilePhoto` / `chooseProfilePhoto`), stored in the public `avatars` bucket under a new random name each time, and shown by `Avatar` from `photoPath`. Every query that returns a player returns its `photo_path`, so pass it to every `Avatar`.
- **Renaming yourself**: the pencil beside your name on the Me tab opens `RenameMeCard`. Only your own player in the trip (`rename_me`), checked the same way as anywhere a player is named (`checked_player_name`, mirrored by `playerNameProblem`): 1 to 30 characters once spaces are tidied, and no one else in the trip with it, ignoring case. `useRenameMe` shows the new name at once in the session (`setMyName`), the player list and the board, and refreshes every list showing players (`queriesShowingPlayers`). Other phones hear it through the `players` table; `useTripLiveUpdates` also reloads the session then, in case another phone is the same player.
- **Deleting an entry**: only the person who logged it, only while it's pending (`canDeleteEntry`, mirroring `delete_entry`). It leaves every list at once (`useDeleteEntry`) and comes back if the server refuses.
- **Sharing a post** (anyone in the trip): the share icon opens the `share/[id]` sheet, which shows the exact receipt picture (`ReceiptSnapshot`) before anything leaves the trip. It shares that picture with a caption (`shareCaption`), saves it, or saves the original photos (`share-actions.ts`), and asks only for permission to add to Photos. The picture waits for its photo to load before it is taken. Links that open the app need a domain and a real build: see PLAN.md.
- **Comments** are one level deep, as the database allows. The box at the bottom of an entry always comments on the entry; tapping a comment opens a reply box under its thread. Replying to a reply joins its thread (`threadIdOf`), so the app never offers a reply the database would refuse. Comments are sent with the keyboard's Send key, with no send button on screen; a reply box has only a small Cancel. Your comment shows straight away, marked as sending, and the field gets its text back if the server refuses it.
- **Day and night (Rundown restyle in progress, see `RUNDOWN-DESIGN.md`).** The screen's ground changes with the light (`useLightMode`, night from 7pm to 6am); paper never does.
  - Things drawn on the ground read their colours through `useGround()`, or `useThemedStyles(makeStyles)` with `makeStyles` at module scope.
  - `Card` marks its contents as paper (`SurfaceContext`). Shared text (`Label`, `MutedText`, `ErrorText`) and secondary `Button`s pick ground or paper colours from it, so they stay legible on both.
  - Screen headings are `SignTitle`; decoration (`GroundBackground`, `NeonSign`) is hidden from screen readers and ignores touches.
- **The "Thermal" look** (`concepts-receipt.html`): a gas station receipt, printed in black and red ink on a grey counter.
  - Colors, fonts, text styles, spacing, radii and springs come from `src/constants/theme.ts`, never hard-coded.
  - Everything is set in JetBrains Mono; headings use the condensed display face. Custom fonts pick their weight by family (`Fonts.bold`), never `fontWeight`. Prefer the `Type` text styles.
  - Every card is a receipt (`Card`, torn top and bottom). Its tape and fold crease come from `receiptWear(seed, wear)`, so pass a stable `seed` (the row's id): the same receipt must look the same every time. The shared picture uses `wear="none"`.
  - Nothing is turned by less than 2°: iOS draws the edges of a slightly rotated view as stair-steps (Expo Go ignores the `UIViewEdgeAntialiasing` setting in `app.json`). Receipts sit straight; decorations lean 2° or more. Checked in `conventions.test.ts`.
  - Receipt pieces live in `src/components/receipt/`: `LineItem` (title, dotted leader, amount), `DashedRule`, `Barcode`, `Stamp`, `PumpDisplay` (one window per number; leading zeros unlit, the real value read aloud).
  - Section headings use `TapeLabel` (its count is part of the heading's spoken name). Small boxed labels (status, who logged it) use `Tag`, which has one fixed height so tags side by side line up.
  - Approve and Decline are pump keys (`Key`), like primary `Button`s.
  - User-facing vote wording is the card terminal's: **Approve / Decline**, statuses **Pending / Approved / Declined**. In code and SQL they stay `confirm` / `reject`.
- **Motion and haptics.** Tappable things use `PressableScale` (or `Button`), which springs under the thumb and plays a haptic from `haptics`: tap on press, success on approve, warning on decline, tick on steppers and pickers. List rows print in through `AnimatedListItem` (pass `index` to stagger). Changing numbers count with `useCountUp`. The stamp lands only when an entry settles while you watch (`useSettledWhileWatching`). Reanimated follows the phone's Reduce Motion setting.
- **Logging points** starts from the "+" in the middle of the tab bar: a tab that can't be selected (`disabled`) and opens the `/log` sheet from its `tabPress` listener, so the current tab stays put. The `(app)/add` route behind it only redirects to `/log`.
- **Lean copy.** No explanatory subtitles or helper sentences: the screen should explain itself. Muted text is only for empty states ("Nothing logged yet"), live information (tallies, "Sending…"), why an action is unavailable, or a warning someone could regret missing (the PIN reminder). Show facts as receipt lines (`LineItem`) rather than sentences.
- **Rule packs**: Create trip picks packs (`RulePackPicker`, the first pack by default, or none). Later the organiser adds packs from the Rules tab (`/rule-packs`, `useAddRulePack`), which adds only rules the trip doesn't already have by name (`rulesMissingFromTrip`, mirroring `insert_rule_pack_internal`). The catalog is read with `useRulePacks`, not `useTripQuery`, because it exists before any trip. Anyone can browse the packs; only the organiser adds or removes them (`canManageRulePacks`). Removing a pack (`useRemoveRulePack`, `remove_rule_pack`) archives every rule copied from it, edited ones included, found by `rules.pack_id` (`rulesFromPack`); rules the trip made up stay, and the pack can be added again.
- **Accounts are optional.** Every phone starts with an anonymous sign-in. "Create account" (`/account`, offered with "Sign in" by `AccountButtons` on the join screen, the Me tab and Rule packs) adds an email to that same sign-in (`updateUser` then a 6-digit code, `type: 'email_change'`), so the user id, its trip and everything it owns stay. "Sign in" switches the phone to an account made elsewhere, so it warns that the phone leaves its current trip; afterwards `startOverAfterSignInChange` clears the cache and reloads the trip. Signing out is this phone only (`scope: 'local'`). `useAccount` says whether there's an account. Supabase's auth errors are reworded in `src/api/account.ts`. After a code is sent, the next one waits a minute with a countdown (`useCountdown`), or as long as Supabase says when it refuses (`WaitBeforeNewCodeError`).
- **Your own rule packs** belong to an account, never a phone's anonymous sign-in (`my_account_id` refuses those, and the Rule packs screen asks for an account first). On the Rule packs screen, a new pack is only a **New pack** button until it's tapped. They're filled from the presets (each folded down to its name until opened, `PresetPackChecklist`), the trip's rulebook or typed in (`AddPackRules`): tick rules and add them together, or swipe one right to add it at once. Swipe a pack's own rule left to remove it. Rules skip names they already have (`rulesMissingFromPack`, mirroring `add_custom_pack_rules`), and are copied into trips like the catalog packs: trip rules record `custom_pack_id`, and `PackRef` lets the same add and remove code handle both kinds. `useCustomPackChanges` updates the `['custom-packs']` cache first, as trip writes do.
- **Swipes** go through `SwipeableRow`: a row swiped far enough acts at once, with no button to tap afterwards (green to add, red to remove). The row inside spreads `screenReaderSwipeActions` with the same actions, because screen readers can't swipe (checked in `conventions.test.ts`). The app root is a `GestureHandlerRootView`, and so is `renderWithQueryClient`'s wrapper in tests. A swipe that removes something skips `ConfirmDeleteButton`, so use it only where removing is easy to undo (a rule in your own pack).
- **Editing and deleting rules**: long-press a rule on the Rules tab to open `rule/[id]`. The organiser can change any rule (pack rules included), and whoever added a rule can change theirs (`canManageRule`, mirroring `rule_i_can_manage`). A rule is checked the same way when it's added or edited (`checked_rule_title`, and `useRuleDraft` + `RuleFields` in the app). Deleting archives it, so logged entries keep their rule and points. Destructive actions ask first through `ConfirmDeleteButton`.
- Points are shown with `formatPoints` (real minus sign).
- The app is light-only (`userInterfaceStyle: "light"`).

## Data and security

- Clients only read, and only rows for trips their device is linked to (RLS). The exceptions: the published rule pack catalog, which any signed-in phone can read, and an account's own rule packs, which only it can read. Every write goes through a `SECURITY DEFINER` function in `supabase/migrations`. Never add client write policies.
- `account_players` remembers every player a sign-in has been (filled by a trigger on `devices`), so past trips and achievements outlive leaving a trip. Phones can't read it directly.
- Schema changes go in a new numbered migration file. Run `npm run db:migrate`, then `npm run db:test`, and add tests for new rules.
- New functions get `revoke ... from public, anon` and an explicit `grant execute ... to authenticated`, as in `0001_core.sql`.
- Error messages raised in SQL are shown to users as-is, so write them as plain sentences.
- **Stored files can't be deleted from SQL** (Supabase blocks it). A function that drops rows pointing at files returns their paths, and the phone removes them through the Storage API under a narrow delete policy (see `0007_delete_entry.sql`). The Storage API's remove also needs a select policy on the bucket.
- **In policies, qualify columns of the policy's own table** (`objects.name`) whenever a subquery joins another table. A bare `name` inside `select … from players` means the player's name (fixed in `0009`).
- **Realtime can't route a DELETE to one trip**, because the old row carries only its id. Anything that deletes rows phones are showing also inserts into a log table they subscribe to, like `deleted_entries`.

## Secrets

`.env` is git-ignored and holds the Supabase URL, the anon key, `supabasedbpw` (database scripts only) and `EXPO_TOKEN` (Expo login). Only `EXPO_PUBLIC_*` values may be used in app code. Never print `.env` values; show key names only.

## Commands

- `npm start` runs the dev server. It loads `.env` first so `EXPO_TOKEN` is picked up. Use `npm run tunnel` if the phone can't reach the PC. On iPhone, Expo Go only opens a dev server signed in to the same Expo account, so other people's phones need a real build (TestFlight).
- `npm run check` runs typecheck, lint, the Prettier format check and unit tests. `npm run format` fixes formatting. `npm run test:watch` while working.
- `npm run db:migrate`, `npm run db:test`, `npm run db:status`.
