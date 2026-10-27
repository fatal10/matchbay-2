# Player 2026/2027 Season Statistics & Coach Accuracy Implementation Plan

Add live-updating 2026/2027 player statistics (goals, assists, appearances, minutes, cards) across team squad rosters and player profile views, correct current head coaches for this season across all 35 competitions, and implement a 24-hour automatic background sync from the live data feed.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following parameters were confirmed during interactive planning:
> - **Data Source**: LiveScore API proxy (`/api/soccer/...`) with dynamic feed extraction and automated daily background sync.
> - **Competition Scope**: All 35 competitions supported across MatchBay.
> - **Squad List Display**: Compact badges with Goals, Assists, and Appearances inline in team roster rows.
> - **Update Frequency & Cache**: 24-hour smart cache with automated daily background refresh and on-demand freshness checks.

---

## 1. Overview & Core Concept

MatchBay displays match fixtures, live scores, standings, and club rosters. This feature introduces comprehensive player performance metrics for the ongoing 2026/2027 season and ensures 100% accurate managerial representation:
1. **Team Squad Roster Stats**: Every player row in the Club modal displays clean, non-intrusive compact stat pills (`⚽ G`, `👟 A`, `👕 APP`) alongside jersey number, name, and nationality.
2. **Dedicated Player Profile Modal**: Tapping any player opens a dedicated player details sheet displaying full season statistics (Goals, Assists, Appearances, Minutes Played, Yellow Cards, Red Cards), position categorization, physical bio (age, height, weight), and current club context.
3. **Current Season Coach Correction Engine**: Eliminates historical/stale coach data in upstream catalogs (e.g., Arsène Wenger at Arsenal, Eddie Howe at Bournemouth) by verifying and resolving current 2026/2027 managerial appointments across all clubs and leagues.
4. **Daily Auto-Updating Data Feed Pipeline**: Feeds player statistics directly from the LiveScore API roster statistics splits and calendar match events, caching responses with a 24-hour TTL and performing background revalidation every 24 hours without hardcoded player figures.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[Tables & Clubs View]
       │
       ▼
 [Select Club Card] ──────────► [Club Roster Modal]
                                      │
                                      ├── Verified 2026/27 Head Coach Banner
                                      └── Squad List by Position
                                            │
                                            ├── Inline Badges: [⚽ 14] [👟 8] [👕 22]
                                            └── Tap Player Row
                                                  │
                                                  ▼
                                     [Player Profile Sheet / Modal]
                                      ├── Hero: Number, Name, Position, Flag, Club
                                      ├── 2026/2027 Season Totals Grid
                                      │     ├── Goals (G)
                                      │     ├── Assists (A)
                                      │     ├── Appearances (Starts / Sub)
                                      │     ├── Minutes Played (MIN)
                                      │     └── Discipline (Yellow & Red Cards)
                                      └── Physical Bio & Age
```

### Visual Identity & Theme Alignment
- **Aesthetic Direction**: Retains MatchBay's dark teal stadium theme (`#050d0e` base, `#0a1a1c` cards, `#143034` borders).
- **Stat Pills in Squad List**: Ultra-compact, non-wrapping micro-badges:
  - Goals: Mint highlight (`rgba(63, 214, 192, 0.12)`, text `#3fd6c0`)
  - Assists: Sky blue highlight (`rgba(56, 189, 248, 0.12)`, text `#38bdf8`)
  - Appearances: Subtle slate (`rgba(255, 255, 255, 0.06)`, text `#c5d6d4`)
- **Player Profile Modal**:
  - Modal backdrop with smooth slide-up reveal (`animation: in .25s ease`).
  - Stat matrix card with 6-cell balanced grid displaying large tabular numerals and clear labels.
  - Zero layout shifts with fixed-height skeletons during loading.

---

## 3. Key Product Decisions & Trade-Offs

- **Compact Squad Inline Badges vs. Full Table Columns**:
  - *Decision*: Compact badges inline on the right of the player row, expanding to the full modal on tap.
  - *Why*: Preserves mobile readability on 320px–430px viewports without horizontal table scrolling or line jumping.
- **2026/2027 Coach Normalization Layer**:
  - *Decision*: Implement a current-season coach resolution adapter that checks verified 2026/2027 managerial rosters whenever the upstream feed returns stale historical data.
  - *Why*: Guarantees accurate club managers (e.g. Mikel Arteta at Arsenal, Arne Slot at Liverpool, Hansi Flick at Barcelona, Enzo Maresca at Chelsea) while remaining synchronized with API updates.
- **24-Hour Smart Cache with Daily Auto-Refresh**:
  - *Decision*: Store player stats in `localStorage` under a versioned key (`matchbay_player_stats_2026_v1`) containing timestamps, expiring every 24 hours.
  - *Why*: Meets the strict "no hardcoded values" requirement while avoiding redundant repetitive API hits on every navigation.

---

## 4. Technical Architecture & Data Strategy

### System & Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LiveScore API Gateway                           │
│   /api/soccer/:league/clubs/:id   &   /api/soccer/:league/scoreboard   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON Roster & Stats Splits
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Player Stats & Coach Sync Engine                     │
│               (src/playerStatsEngine.ts / public/*.js)                 │
│  - Extracts 2026/27 statistics (G, A, APP, MIN, YC, RC)                │
│  - Verifies & normalizes current 2026/27 head coaches                  │
│  - Manages 24-hour cache TTL (auto-sync if age > 24 hours)             │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
   ┌────────────────────────────────┐   ┌────────────────────────────────┐
   │     Squad List Micro-Badges    │   │      Player Profile Modal      │
   │  (Goals, Assists, Appearances) │   │ (Full 2026/2027 Season Totals) │
   └────────────────────────────────┘   └────────────────────────────────┘
```

### Proposed Changes Across Codebase
1. **`src/playerStatsEngine.ts` & `public/playerStatsEngine.js`**:
   - Stat parsing logic for `statistics.splits` (goals, assists, appearances, minutes, yellow/red cards).
   - 2026/2027 coach registry and correction adapter.
   - 24-hour cache manager with background revalidation.
2. **`public/app.js`**:
   - Update `adaptClubDetail()` to parse player season statistics and correct coach names.
   - Update `clubModal()` to render compact stat badges in each player row and handle `data-open-player`.
   - Add `playerModal()` to display full player season details and bio.
   - Update event listeners and URL hash/navigation for smooth player modal open/close.
3. **`public/style.css`**:
   - Add `.player-stat-pills`, `.stat-badge`, and `#player-modal` styling in MatchBay design system.
4. **`src/playerStatsEngine.test.ts`**:
   - Automated unit tests verifying stat extraction, coach resolution, and 24-hour cache expiry logic.
