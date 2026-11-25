# Rundown gas station: design handoff

This is the brief for restyling Receipts from the "Thermal" look (black and red ink on grey) to the **Rundown gas station** look, with a **day mode (Midday)** and a **night mode (3am)** that switch automatically with the phone's local time.

- Visual reference: [`concepts-rundown.html`](concepts-rundown.html). Open it in a browser. Row 1 is Midday, row 2 is 3am, and the style sheet is at the bottom. Each screen has an id (`day-feed`, `night-board`, …). Everything in it is plain HTML with inline styles, so exact values can be read straight from the markup.
- This replaces the "Thermal" look section of `CLAUDE.md` once it ships (see Phase 6).
- Everything in `CLAUDE.md` still applies: theme tokens only, `Type` styles, `Screen` as the outer container, `PressableScale`/`Button` for taps, `useAsyncAction`, tests in `__tests__/`, `npm run check` green before each phase is done.
- **Behaviour does not change.** This is a visual pass. No query, permission, voting or copy changes unless listed below.

## The idea in one paragraph

A tired roadside gas station. The **ground** (the screen background, titles, the pump display, the tab bar, buttons that sit on the background) is the forecourt: sun-faded concrete by day, dark asphalt under an orange streetlight at night. Everything the group writes lives on **paper**: torn thermal receipts, slightly crooked, with fold creases, a strip of tape and the odd coffee ring. Headings are plastic letters slid into a sign. Section labels are marker on masking tape. The wear is **decoration only**: names, points, buttons and inputs are always crisp and readable.

## Changed after review

- **No canopy.** The red band over the status bar was dropped: the ground runs to the very top of the screen.
- **No concrete grain.** A dot repeated every 5px across the scrolling content made scrolling lag. The ground is a flat colour with a few large stain gradients (and the streetlight at night).
- Wear and the ground are drawn with React Native's native gradients (`backgroundImage`), not SVG, so tall screens don't become huge bitmaps.
- **Board has no trip total.** Everyone plays for themselves, so adding the players up means nothing (an earlier product decision, covered by a test).
- **Receipts aren't tilted, and nothing leans less than 2°.** iOS draws the edges of a slightly rotated view as stair-steps, which showed on every tag and border. Tape labels lean 2.5°, evidence prints ±2–2.5°.
- **No coffee rings.** They looked like stray circles rather than stains.
- **No "missing letter" on the price sign and no "pay inside" note on the pump.** Both read as mistakes.
- **Entry's back link says "Back"**, not "Feed": the entry screen also opens from a player's page.

## Two surfaces: ground and paper

This split is what makes day/night cheap.

| Surface | What sits on it | Day vs night |
|---|---|---|
| **Ground** | Screen background, sign titles, neon sign, pump display, tab bar, back links, buttons and muted text placed directly on the background | **Changes** |
| **Paper** | Every `Card` (receipt) and everything inside it: line items, tags, fields, pickers, comments, vote keys' surroundings | **Identical** in both modes |

So most paper components never need to know the mode. Only ground components (and the vote keys, which glow brighter at night) read the mode.

## Tokens

Replace the single `Colors` object in `src/constants/theme.ts` with:

### `Paper` (constant)

| Token | Value | Use |
|---|---|---|
| `paper` | `#FBF6E8` | Receipt background |
| `ink` | `#1F1C18` | Text on paper |
| `red` | `#B3261E` | Minus points, Declined, circled counts, stamps |
| `green` | `#2F7A4B` | Approved tag, Bonus selected |
| `muted` | `#6A6358` | Secondary text on paper |
| `dots` | `#CFC7B4` | Dotted leaders |
| `rule` | `#D3CAB6` | Dashed rules, row dividers |
| `highlight` | `#F6E3A6` | "You" row, selected picker item, Pending tag |
| `tape` | `#E9DFC2` | Masking tape labels and taped notes |
| `field` | `#F3EDDC` | Text field background |
| `fieldLine` | `#CFC7B4` | Text field border |

### `Ground.day` and `Ground.night`

| Token | Day (Midday) | Night (3am) | Use |
|---|---|---|---|
| `ground` | `#D9D2C3` | `#15161A` | Screen background |
| `text` | `#2A2622` | `#F1E9D8` | Text on ground |
| `textMuted` | `#5C554B` | `#B9AE9A` | Eyebrows, muted text on ground |
| `line` | `rgba(42,38,34,0.25)` | `rgba(241,233,216,0.25)` | Dividers on ground |
| `stain` | `rgba(45,38,30,0.14)` | `rgba(120,140,190,0.08)` | Oil stains |
| `streetlight` | none | `rgba(255,150,60,0.22)` | Radial glow from the top centre |
| `neon` | `#8E6A63` | `#FF4A5A` | Neon sign tube colour |
| `neonLit` | `false` | `true` | Glow on, one dead letter flickers |
| `pumpBody` | `#B04C40` → `#8F3C32` | `#34363C` → `#24262B` | Pump housing (vertical gradient) |
| `pumpEdge` | `#6E2C24` | `#43464D` | Pump housing border |
| `pumpLabel` | `#9C968A` | `#9C968A` | Labels inside the display |
| `display` | `#0D0D0C` | `#050506` | LED window |
| `led` | `#FFB627` | `#FF9D3A` | LED digits |
| `ledGlow` | `rgba(255,182,39,0.6)` | `rgba(255,157,58,0.7)` | `textShadowColor`, radius 10 |
| `primary` / `onPrimary` / `primaryEdge` | `#F2C230` / `#1F1C18` / `#1F1C18` | `#FF9D3A` / `#15161A` / `#7A4310` | Primary key, log button |
| `approve` / `onApprove` / `approveEdge` | `#3F8A5A` / `#FFFFFF` / `#28603C` | `#3FBF73` / `#0B1F12` / `#22703F` | Approve key |
| `decline` / `onDecline` / `declineEdge` | `#B3261E` / `#FFFFFF` / `#7A1912` | `#FF4A5A` / `#24070B` / `#93202C` | Decline key |
| `navBackground` | `#C3BDB0` + diamond plate | `#1B1C20` + faint diamond plate | Tab bar |
| `navBorder` | `#6D675C` (3px) | `#FF4A5A` (2px) | Tab bar top edge |
| `navIcon` / `navActive` | `#4E483F` / `#B3261E` | `#A59C8C` / `#FF9D3A` | Tab icons and labels |
| `signFrame` / `signBody` | `#B4463A` / `#F4F1E8` | `#2B2D33` / `#FFF8E6` (+ soft white glow) | Board price sign |
| `tileBack` | `#2A2724` | `#2A2724` | Backing behind sign letters |
| `cardShadow` | `0 6 10 rgba(50,40,25,0.22)` | `0 10 18 rgba(0,0,0,0.55)` | Receipt drop shadow |

Contrast was checked for text on each surface (4.5:1 body, 3:1 for the 18px+ bold key labels). Keep it that way when tweaking.

### Fonts

| Family | Weights | Use |
|---|---|---|
| JetBrains Mono (have) | 400, 600, 700, 800 | Everything on the receipt, LED digits, eyebrows |
| Barlow Condensed (have 800; **add 600 and 700**) | 600–800 | Names, sign letters, button and key labels, back links, tab labels |
| **Permanent Marker** (add `@expo-google-fonts/permanent-marker`) | 400 | Tape labels and taped notes **only** |

Add to `Fonts`: `displayBold` (Barlow 700), `marker`. Add to `Type`: `signLetter`, `tape` (marker 17), `key` (Barlow 800, 20, letterSpacing 1.5, uppercase), `backLink` (Barlow 700, 17, letterSpacing 1.5, uppercase), `tabLabel` (Barlow 700, 12, letterSpacing 1.5, uppercase), `name` (Barlow 800, 24, uppercase, replaces the mono `name`).

### Radii and spacing

Spacing scale is unchanged. Radii: keys and buttons `8`, sign tiles `2`, LED window `6`, pump housing `12`. Receipts have **no** radius (torn edges top and bottom).

## Assets: all drawn, no image files

Everything is drawn with **react-native-svg** (already installed, 15.16) and plain styles. No PNG textures and no new native dependencies apart from the marker font. This keeps it crisp, themeable and small.

| Piece | How |
|---|---|
| Torn edge | Existing `TornEdge`. Use it at the **top and bottom** of every receipt (today it's bottom only). Top edge is the same pattern flipped. |
| Oil stains | 2–3 SVG `RadialGradient` ellipses in `stain`, fixed positions per screen |
| Streetlight glow (night) | One large `RadialGradient` at the top centre |
| Fold creases, yellowed ends | SVG `LinearGradient` overlay inside the receipt: one near-vertical hairline crease, a faint diagonal, and a 60px yellowish fade (`rgba(214,190,130,0.22)`) at the top and bottom |
| Tape strip | 74×22 rect, `rgba(233,223,194,0.85)`, rotated −3°, centred over the receipt's top edge |
| Coffee ring | Circle, 4px stroke `rgba(120,72,28,0.16)`, ~90px, partly off the edge of the receipt |
| Duct tape | 54×16 rect with 3px stripes `#A9A9A4`/`#9C9C97`, rotated 28°, over the Decline key's top-right corner |
| Masking tape label | Tape rect with slightly jagged ends (SVG path), rotated −1.5° |
| Red pen circle | Ellipse stroke 2.5px `red`, rotated −6°, around a count |
| Diamond plate (tab bar) | Two crossed diagonal line patterns at low opacity |
| Neon glow | `textShadow` (radius 6 and 16) plus `boxShadow` on the tube border (RN 0.88 supports `boxShadow` on the New Architecture) |
| Barcode, stamp, dotted leader, dashed rule | Existing components, restyled |

Every decorative piece is hidden from accessibility (`accessible={false}`, `importantForAccessibility="no-hide-descendants"`) and has `pointerEvents="none"`.

**Seeded wear.** Each receipt's tilt, tape and coffee ring come from its id (like `Barcode` uses `seed`), so a receipt looks the same every time it renders and never jumps. Put this in a pure helper, `src/utils/receipt-wear.ts`:

- `tilt`: −0.8° to +0.8°. Forms (log slip, create trip, entry detail) clamp to ±0.4°.
- `taped`: about 1 in 2
- `coffeeRing`: about 1 in 4, with a corner and size
- Receipts in the share snapshot get **no** coffee ring and no tilt, so the shared picture is clean.

## Day and night switching

### The rule

- A pure function, `src/utils/light-mode.ts`: `lightModeAt(date: Date, preference: 'auto' | 'day' | 'night'): 'day' | 'night'`.
- `auto`: **night from 19:00 to 05:59 local time**, day otherwise. The phone's clock is already local, so no location permission is needed.
- `nextLightChange(date)` returns the next 06:00 or 19:00, for the timer.
- Unit tests at 05:59, 06:00, 18:59, 19:00, midnight, and each fixed preference.

### The hook and provider

- `LightModeProvider` in the root `_layout.tsx`, with `useLightMode()` returning `{ mode, preference, setPreference }` and `useGround()` returning the active `Ground` palette.
- Preference is stored with AsyncStorage next to the session keys (`pointtracker.lightPreference`), defaulting to `auto`. It's device-level, not per trip.
- Re-evaluate when the app returns to the foreground (follow the pattern in `use-refetch-on-app-foreground.ts`) and on a timeout set to `nextLightChange`.
- When the mode changes while the app is open, cross-fade the ground over ~600ms. When going to night, the neon "flickers on" (two quick opacity blinks, then lit). Both follow Reduce Motion, like the rest of the app.

### Making styles themeable

48 files import `Colors` and build styles once at module load. Approach:

1. Paper-only components switch their import from `Colors` to `Paper` and stay as `StyleSheet.create` at module scope. Most components are in this group.
2. Ground components use a small `useThemedStyles(makeStyles)` helper, where `makeStyles = (ground: GroundPalette) => StyleSheet.create({...})`, memoised per mode.
3. Remove `Colors` once nothing imports it. Extend `conventions.test.ts` so `Colors` can't come back, and so ground colours are only read through `useGround()`.

### Native pieces

- `NativeTabs` props (`backgroundColor`, `tintColor`, `badgeBackgroundColor`, `labelStyle`) come from the ground palette.
- `expo-status-bar`: `dark` style by day, `light` at night.
- Keep `userInterfaceStyle: "light"` in `app.json`. Text fields live on paper, which is light in both modes, so the keyboard and system sheets can stay light.

## Components

Map to existing files wherever possible.

| Component | File | Change |
|---|---|---|
| **GroundBackground** | new, `components/ground/ground-background.tsx` | Fills behind content, from the top of the screen down: `ground` colour, stains, streetlight (night). Drawn **inside** the ScrollView content as an absolute layer so `Screen`'s first child is still the ScrollView (see the comment in `screen.tsx`). |
| **SignTitle** | replaces `Title` in `typography.tsx` | The heading spelled in white plastic letter tiles (Barlow 800 at 0.86× tile height, tile 0.56× wide, 2px gap, `tileBack` behind, 4px radius). One tile per word is knocked crooked (rotate 7°, +2px), chosen from the word so it's stable. Optional `eyebrow` above in mono 10.5 `textMuted`, and an optional `right` slot. `accessibilityRole="header"` with the word as label; tiles hidden. |
| **NeonSign** | new | Text in a 2px rounded tube border, rotated 3°. Day: unlit (`neon` colour, no glow). Night: lit with glow, one dead letter at 0.35 opacity that flickers now and then (Reanimated, off with Reduce Motion). Decorative only. Used next to the Feed and Join titles ("OPEN") and the Rules title ("NO REFUNDS"). |
| **Card** (receipt) | `card.tsx` | Torn edges top and bottom, `paper` background, crease overlay, seeded tilt, tape and coffee ring, `cardShadow`. Keep `collapsable={false}`. New props: `wear?: 'full' \| 'light' \| 'none'` (default `full`; forms use `light`; snapshot uses `none`). Pass an `id` for the seed. |
| **TapeLabel** | replaces `SectionLabel` | Marker text on tape, rotated −1.5°. `count` shows inside a red pen circle. Keep the header role, and include the count in the accessibility label ("Needs your vote, 2"). |
| **Tag** | `tag.tsx` | Same fixed height (22). Kinds: `pending` (highlight fill, ink border), `approved` (green border and text), `declined` (red), `outline` (ink, for "By Alex" / "Self"). Mono 800, 10px, uppercase. |
| **PumpDisplay** | `receipt/pump-display.tsx` | Housing in `pumpBody` gradient with `pumpEdge` border and two soft scuffs. Supports **several cells** side by side (Feed: Your total, Pending, Rank). Digits are padded to 3 and **leading zeros are drawn at 0.18 opacity** (unlit segments). Read the real value aloud, not the padded one. Optional taped marker note ("pay inside") overlapping the bottom-right corner. Negative values keep using `red`. |
| **PumpKey** | `feed/vote-buttons.tsx` | Approve and Decline become chunky keys: 52 tall, radius 8, 5px darker bottom edge (`approveEdge`/`declineEdge`), Barlow 800 20 uppercase with a check or x icon. Decline has the duct tape. Haptics unchanged. Press: drop 3px and lose the edge. |
| **Button** | `button.tsx` | `primary`: the same key style in `primary`/`onPrimary`/`primaryEdge`. `secondary`: transparent with a 2px border. New `surface?: 'ground' \| 'paper'` prop: on ground it uses `text`, on paper it uses `ink`. `danger`: `red` key. |
| **BackLink** | `back-link.tsx` | Chevron and label in `Type.backLink`, `text` colour, 44px tall. |
| **LineItem**, **DottedLeader**, **DashedRule** | `receipt/` | Same structure, `Paper` colours. |
| **Stamp** | `receipt/stamp.tsx` | Red double-ruled rubber stamp, ~88% opacity, rotated about −10°, with a small second line (e.g. "3 / 3 VOTES"). |
| **Avatar** | `avatar.tsx` | 2px `ink` ring around the player colour or photo; initials in Barlow 800. |
| **PriceSign** | new, `board/price-sign.tsx` | Board top three: `signFrame` around a `signBody` panel; heading "TODAY'S LEADERS" in small tiles with the **A missing** (an empty slot); rows of name tiles and points tiles. Names over 10 letters use the first 10. Hidden from accessibility, because the standings receipt below says the same thing properly. |
| **Tab bar** | `(app)/_layout.tsx` | See "Tab bar" below. |

### Tab bar

The design shows diamond plate and a raised round yellow "+" button. `NativeTabs` draws the system tab bar, which can only take colours. So:

- **Now:** keep `NativeTabs` and theme its colours (`navBackground`, `navIcon`, `navActive`, badge `red`). Don't swap it out.
- **Later, optional:** a custom JS tab bar would allow the diamond plate and raised "+". That gives up the native tab bar, so check the Expo SDK 58 docs first (see `AGENTS.md`) and treat it as its own change.

## Screens

The left column of the reference is day; the night row is the same layout with the ground palette swapped.

### Feed (`(app)/index.tsx`)

- `SignTitle` "FEED", eyebrow "{trip} · {me}", `NeonSign` "OPEN" on the right.
- New `PumpDisplay` with three cells: **Your total** (my leaderboard points), **Pending** (count still needing my vote, the same number as the tab badge), **Rank**. All from queries the app already has. The leaderboard is cached and shared, so this adds no fetches. Taped note "pay inside".
- `TapeLabel` "Needs your vote" with the count circled, then entry cards. `TapeLabel` "Recent", then the rest.
- **EntryCard (list):** meta line (TXN, relative time) in mono 10.5 muted; avatar 40, name in `Type.name`, tags (status + who filed it); dashed rule; the line item (rule ··· points, 18px points); the note; photo strip; PumpKeys if I can vote; footer with tally squares (filled ink square per approval), "1 OF 3 APPROVALS", comment count and share icon (44px target). Settled entries get the stamp; declined points are struck through in muted.

### Entry (`entry/[id].tsx`)

- BackLink "Feed" and a share icon on the right.
- **Evidence photos:** each full photo is a white-bordered print (8px border, 28px bottom), tilted about −1.2°, with two tape strips at the top corners and a marker caption "exhibit A", "exhibit B"… by index.
- Detail receipt: TXN and time; avatar 44 and name; tags; line item; note; dashed rule; tally squares + "1 of 3 approvals"; `LineItem` rows "Approved by", "Declined by", "Needs"; PumpKeys or the existing sitting-out / voted text; barcode; "0042 · KEEP THIS RECEIPT".
- `TapeLabel` "Comments" with count. All comments sit inside **one** receipt: avatar 28, name in Barlow 800 15, time muted, body in mono 13, "REPLY" in mono 800 10. Replies are indented with a dotted left rule. The composer field is at the bottom of that receipt, on paper.
- Delete stays where it is today and only shows when allowed.

### Log sheet (`log.tsx`)

- Grabber, BackLink "Cancel", `SignTitle` "LOG IT".
- The whole form is **one receipt, a "claim slip"**: "★ CLAIM SLIP ★ / {trip}" header, then sections divided by dashed rules, each with a small mono label:
  - **Who:** `PlayerPicker` as a 3-column grid; selected = `highlight` fill and 2px ink border.
  - **What happened:** `RuleKindButtons` (Penalty outlined red; Bonus filled green when selected, and vice versa), the search field, results as tappable line items (selected row highlighted), and "+ NEW RULE "…"". `ChosenRule` looks like a selected line item with a "Change" link.
  - **Photos (optional):** 88px thumbnails with a round ink remove button, and a dashed "ADD" tile with a camera icon.
  - **Note (optional):** multiline field.
  - Short barcode at the end.
- Primary key below the slip: "LOG +10 FOR JORDAN" (existing title logic).

### Board (`(app)/board.tsx`)

- `SignTitle` "BOARD", eyebrow "6 players".
- `PriceSign` with the top three.
- `PumpDisplay` "YOU · #3 · PTS" (the existing one, restyled).
- `BoardReceipt`: "★ RECEIPTS GAS & GO ★ / STANDINGS · {trip}", then the existing rows: rank, avatar 28, name (★ for the trip's special guest, "(you)"), pending count under the name, dotted leader, points, chevron. "You" row in `highlight`. Then entries logged / awaiting approval (only if the data's already there, otherwise leave them out), a trip total, barcode, and "CODE {join code} · PRINTED {time}" from the existing props.

### Player (`player/[id].tsx`)

- BackLink "Board".
- Header: the avatar as a taped instant photo (white border, tilted −3°), name in `SignTitle` tiles, and a mono line with the role, rank and pending count.
- `PumpDisplay` "TOTAL" with the points.
- `TapeLabel` "Pending" / "Approved" with counts, and EntryCards as on the Feed.

### Rules (`(app)/rules.tsx`)

- `SignTitle` "RULES", eyebrow "{n} rules", small `NeonSign` "NO REFUNDS".
- "Add a rule" and "Rule packs" as two secondary buttons side by side (ground surface).
- `TapeLabel` "Penalties" / "Bonuses" with counts. Each group is one receipt; rows are line items with points (minus in red), divided by dashed lines, at least 44px tall. "ADDED ON THE TRIP" in red mono 800 9.5 under a row, as today. Long-press to edit is unchanged.

### Me (`(app)/me.tsx`)

- Avatar 68 with the camera badge (badge border = `ground`), eyebrow with roles, name in `SignTitle`.
- Trip receipt: label "Trip", trip name in Barlow 800 30, "Approvals needed" line.
- Invite receipt: the join code in an **LED display** (mono 800 34, letterSpacing 10, `led` with glow), then "Share code" (secondary, paper surface).
- **New "Lights" receipt:** a segmented control **Auto / Day / Night** (sun and moon icons) bound to `useLightMode().setPreference`. Live info on the right in mono 11 muted: "NIGHT FROM 7PM" by day, "DAY FROM 6AM" at night (hide it when a fixed mode is picked). Use the existing `segmented-control.tsx`, restyled: 2px ink border, selected segment ink-filled.
- "Leave trip on this phone" as a secondary button on the ground.

### Join (`join.tsx` and `components/join/`)

- Eyebrow "GAS & GO · OPEN 24 HRS", **RECEIPTS** in big sign tiles (42), "Join the trip" in Barlow 800 30 with `NeonSign` "OPEN".
- "Last trip on this phone" receipt with the code as a line item and a primary "Rejoin {trip}" key.
- `TapeLabel` "Or enter a trip code". **The trip code field becomes an LED display** inside a pump housing: mono 800 34, letterSpacing 16, centred, `led` with glow. Keep `TripCodeField`'s existing hidden-input approach (see `CLAUDE.md`); only the drawn value changes.
- Primary "Find trip". Dashed divider, muted "Organising the trip?", secondary "Create a new trip".
- Player step and PIN step: same pieces (SignTitle, receipts, primary key). PIN boxes look like the create-trip PIN boxes below.

### Create trip (`create-trip.tsx`)

- BackLink, `SignTitle` "NEW TRIP".
- Trip name in its own receipt.
- `TapeLabel` "Who's in" → players receipt: numbered rows (01, 02…), each name input underlined with a dotted leader, the organiser marked "ORGANISER · YOU", and a 44px star toggle per row for the trip's special guest (red when on). "Add player" secondary (paper surface).
- `TapeLabel` "House rules" → one receipt: approvals needed with a −/+ stepper (`number-stepper.tsx` restyled: 44px outlined ink squares), dashed rule, rule packs as checkbox rows (ink-filled box when picked, rule count on the right), dashed rule, PIN as four boxes on `field`, and the existing muted reminder.
- Primary "Create trip", then the existing "Needs a trip name…" hint.

### Share (`share/[id].tsx`)

- BackLink "Close", `SignTitle` "SHARE", eyebrow "This is what gets sent".
- **ReceiptSnapshot** is paper only (`wear="none"`): small RECEIPTS tiles header, trip and TXN line, the photo, name, line item, "Filed by", barcode and the stamp when settled. Because it's paper only, a shared picture looks the same whatever time it was taken.
- Primary "Share", secondary "Save receipt to Photos" and "Save original photos" (ground surface, download icon).

### Screens not drawn

Rule packs, Edit rule and the join player/PIN steps aren't drawn separately. Build them from the same pieces: SignTitle, BackLink, TapeLabel, receipts, keys and fields.

## Copy and content notes

- The design shows some **decorative words** that aren't app copy: "PUMP 04", "GAS & GO", "OPEN 24 HRS", "KEEP THIS RECEIPT", "NO REFUNDS", "pay inside", "★ CLAIM SLIP ★". They're signage, which fits the "Lean copy" rule as long as they stay decorative and never explain anything. Keep them `accessible={false}` where they are purely decorative.
- The mock shows "day 2 of 3" on the price sign. **Trips have no dates, so leave that note out.**
- The mock says "Guest of honour" where the app says "Groom". **Keep the app's current wording** in this pass. Renaming the role is a separate product decision.
- Rule pack names, player names and numbers in the mock are sample data.
- Approve / Decline and Pending / Approved / Declined wording is unchanged.

## Motion

- Reuse `Springs`. Keys drop 3px on press.
- The stamp still lands only when an entry settles while you watch.
- New: neon flicker (night only), the mode cross-fade, and leading-zero digits never animate.
- Everything respects Reduce Motion.

## Order of work

Each phase ends with `npm run check` green and screens still working.

1. **Tokens and mode logic.** `Paper`, `Ground.day/night`, fonts (add Permanent Marker and Barlow 600/700), `light-mode.ts` with tests, `LightModeProvider`, preference storage. Nothing looks different yet.
2. **Ground.** `GroundBackground`, `SignTitle`, `NeonSign`, `BackLink`, `Button` with `surface`, status bar and `NativeTabs` colours. Switch `Screen` to the new background.
3. **Paper.** `receipt-wear.ts` with tests (same id → same wear), `Card` with top and bottom torn edges, creases, tape and coffee ring, `TapeLabel`, `Tag`, `Stamp`, `Avatar`, `PumpDisplay` (multi-cell, dim zeros), `PumpKey`.
4. **Screens**, in this order: Feed, Entry, Log, Board (+ `PriceSign`), Player, Rules, Me (+ Lights setting), Join, Create trip, Share, then rule packs and edit rule.
5. **Night pass.** Go through every screen in night mode; check contrast on the ground, the neon flicker, the cross-fade and Reduce Motion.
6. **Docs and guards.** Replace the "Thermal" look section in `CLAUDE.md` with a "Rundown" section (ground vs paper, tokens, SignTitle, TapeLabel, seeded wear, decorations hidden from accessibility). Point the README at `concepts-rundown.html`. Extend `conventions.test.ts`: no `Colors` import, no hex outside `theme.ts`, ground colours only through `useGround()`.

## Tests to add

- `light-mode.test.ts`: boundaries, preferences, `nextLightChange`.
- `receipt-wear.test.ts`: deterministic for an id, tilt within limits, `none` gives no wear.
- `LightModeProvider`: the stored preference loads; a foreground event re-evaluates (mock the clock with Jest fake timers).
- Component tests: `TapeLabel` exposes "Needs your vote, 2" as a header; `SignTitle` exposes its word as a header and hides the tiles; `PumpDisplay` reads "35", not "035"; `Button` `surface` picks the right colour; `NeonSign` is hidden from accessibility.
- Update existing screen tests in `src/__tests__/` where titles and section labels changed component.
