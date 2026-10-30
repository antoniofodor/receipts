# Point Tracker MVP plan

Bachelor trip points app: a shared feed of evidence posts and a live leaderboard. Entries only count once enough players vote to confirm them. Design reference: [concepts.html](concepts.html) (v0.3, "Receipts" direction).

## MVP goal

A group of friends can install the app, join the trip, and over a full day:

1. Log points for themselves or anyone else, picking a rule from the shared rulebook or creating a new one.
2. Attach photos as evidence.
3. Vote entries through: 3 confirms and the entry counts, 3 rejects and it's removed.
4. Argue about it in comments and replies.
5. Watch the leaderboard update live.

Anything that doesn't serve those five is out of the MVP.

## Scope

**In the MVP**

| Area | What's included |
|---|---|
| Trip | Organiser creates a trip, adds player names, gets a 6-letter join code |
| Identity | Join with code, tap your name, set a 4-digit PIN. Phone stays signed in. Rejoin on a new phone with the PIN |
| Rulebook | Preset rules, list and search, anyone can create a rule (−25 to +25) |
| Log entry | Pick player (self allowed), pick or create rule, points, note, up to 3 photos |
| Voting | Confirm or reject. Threshold of 3, set per trip. The person who logged it and the person it's about can't vote |
| Feed | Newest first, with pending, confirmed or rejected state and a "Needs your vote" banner |
| Entry detail | Photos full-size, who voted which way, comments with one level of replies |
| Leaderboard | Confirmed points only, rank, pending count per player, live updates |

**After the MVP**, in rough priority order: push notifications, groom ×2 multiplier and daily overrule, reactions, video evidence, daily standings and forfeit zone, organiser tools (edit or merge rules, reset PIN in the app), offline queue, end-of-trip awards and recap.

## Decisions taken (change any of these)

- **Vote threshold is a per-trip setting**, default 3. A group of 5 has only 3 eligible voters per entry, so a smaller group can lower it.
- **Pending entries don't expire** in the MVP. They stay in "Needs your vote" until they reach 3 confirms or 3 rejects.
- **Votes can't be changed** once cast. This keeps the logic simple.
- **Rules join the rulebook immediately**, even if the entry they were created for is later rejected. The organiser can delete rules directly in the database until organiser tools exist.
- **Photos only**, compressed on the phone to about 1600px JPEG before upload.
- **Distribution is decided at milestone 7.** The same Expo codebase can ship as a native app (Android file, iPhone TestFlight) or as an installable web app.

## Tech stack

- **App:** Expo (React Native) with TypeScript and Expo Router.
- **Backend:** hosted Supabase (free tier) for Postgres, Auth, Storage and Realtime. Two projects: `pointtracker-dev` for building and testing, and `pointtracker-trip` for the real thing. The free tier allows two. Schema changes live as SQL migration files in the repo and get applied to both. No local Supabase stack, so no Docker needed. That's revisitable if the dev project gets in the way.
- **Packages:** `@supabase/supabase-js`, `expo-secure-store` and AsyncStorage (session storage), `expo-image-picker`, `expo-image-manipulator`, `expo-image`.

### Security model

All rules that matter are enforced in the database, not the app:

- **Row-level security:** a user can only read data for trips their device is linked to.
- **Writes that need checks go through Postgres functions (RPCs)** rather than direct table inserts:
  - `create_trip(name, player_names[], pin)` returns the trip and join code, with the creator as organiser.
  - `join_trip(code, player_id, pin)` links the device on first join and checks the PIN on later joins. PINs are stored hashed with pgcrypto.
  - `create_entry(subject_id, rule_id | new_rule, points, note)` creates the rule inline if needed and enforces the −25 to +25 limit.
  - `cast_vote(entry_id, confirm)` blocks the logger and the subject from voting, blocks double votes, and flips the status at the threshold. It locks the entry row so two votes landing together are counted correctly.
- **Leaderboard** is a view: sum of confirmed points per player, plus their pending count.
- **Storage:** private `evidence` bucket, readable only by trip members through signed URLs.

### Phones remembering their player

Supabase anonymous sign-in on first open. The session is stored with Supabase's recommended large-secure-store pattern: the session itself sits in AsyncStorage, encrypted with a key held in SecureStore, because SecureStore limits the size of each value. The `devices` table links the anonymous user to a player, so one player can have more than one phone.

## Data model

```
trips      id, name, join_code, vote_threshold (default 3), created_at
players    id, trip_id, name, color, is_groom, is_organiser, pin_hash
devices    auth_user_id (pk), player_id, trip_id, last_seen
rules      id, trip_id, title, points, kind (penalty|bonus),
           created_by, is_preset, archived, created_at
entries    id, trip_id, subject_id, filed_by, rule_id, points, note,
           status (pending|confirmed|rejected), created_at, resolved_at
evidence   id, entry_id, storage_path, width, height
votes      entry_id, voter_id, confirm (bool), created_at   pk(entry_id, voter_id)
comments   id, entry_id, parent_id (null = top level), author_id, body, created_at
view leaderboard   player_id, confirmed_points, pending_count, rank
```

## App screens

Folder conventions are in [CLAUDE.md](CLAUDE.md). Routes:

```
src/app/
  _layout.tsx          route guard: trip screens if this phone is in a trip, otherwise join / create
  join.tsx             enter code, pick name, PIN (also "Create a trip")
  create-trip.tsx      trip name, player names, groom, vote threshold, PIN
  (app)/index.tsx      feed: leaderboard face strip, needs-vote banner, entry cards
  (app)/board.tsx      full leaderboard
  (app)/rules.tsx      rulebook list, search, add rule
  (app)/me.tsx         trip info, invite code, leave
  log.tsx              (milestone 3) modal: photos, who, rule search or create, points, note
  entry/[id].tsx       (milestone 4) photos, vote buttons and tally, comment thread
```

## Milestones

Each milestone ends with something you can try on your phone.

| # | Milestone | Done when |
|---|---|---|
| 0 | **Setup.** *(mostly done: anonymous sign-in to enable, app not yet run on a phone)* Create the Supabase project, scaffold the Expo app, install Expo Go on your phone, initialise git | The app runs on your phone through Expo Go and talks to Supabase |
| 1 | **Database.** *(done: 20 tests passing)* Tables, RLS, RPCs, leaderboard view, preset rules | SQL test script passes: votes from the logger or subject are refused, the 3rd confirm flips to confirmed, the 3rd reject flips to rejected, a non-member can't read the trip |
| 2 | **Identity.** *(built, needs testing on a phone)* Create trip, join with code and PIN, session persists | Close and reopen the app: still signed in. A second phone joins with the PIN |
| 3 | **Rules and logging.** Rulebook tab, log modal with rule search and inline rule creation, self-logging | You log an entry using a brand-new rule and the rule appears in the rulebook |
| 4 | **Voting, feed and leaderboard.** Feed cards with states, vote buttons, banner, live leaderboard | Three test players confirm an entry and the leaderboard updates on another phone without refreshing |
| 5 | **Photos.** Camera or library, compression, upload, display in feed and detail | A photo taken on one phone shows on another within seconds |
| 6 | **Comments.** Thread on entry detail, replies one level deep, live updates | A reply shows nested under its parent on both phones |
| 7 | **Ship to friends.** Decide native vs web app, build, set up Maestro end-to-end flows for join, log and vote, install on everyone's phones, practice round | The whole group plays a test evening and the feedback is written down |

Milestones 1 to 4 are the core. Once they're done the app works end to end with text-only entries, and photos and comments add to that.

## Testing

Strategy and rules are in [CLAUDE.md](CLAUDE.md#testing):

- **Database tests:** `npm run db:test`.
- **Unit and component tests:** `npm test`, with Jest and React Native Testing Library.
- **End-to-end:** Maestro flows from milestone 7, once there are real builds.
- **Real devices:** two phones by milestone 2, ideally one iPhone and one Android.

## What you need to do

1. Create a free Supabase account and a project called `pointtracker-dev`. I'll need the project URL and the anon key, which are safe to put in the app, plus the database password for running migrations. The trip project can wait until milestone 7.
2. Install **Expo Go** on your phone from the App Store or Play Store.
3. Before milestone 7, say how many people are going and whether everyone is on iPhone, Android or a mix.
