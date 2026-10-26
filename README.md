# Nguyendex

A Pokédex built on [PokeAPI](https://pokeapi.co) with Expo SDK 58 and Expo Router. Runs on iOS and Android,
and on the web as an installable, offline-capable PWA.

## What's in it

- **Tabs**: Home, Favourites, Explore, Tools and Search. iOS and Android use the system tab bar (Liquid Glass
  on iOS 26+, with Search as its own round button; Material on Android). The web uses a floating capsule
  bar instead (`src/components/TabLayout.js` / `TabLayout.web.js`).
- **Home** (`src/app/(tabs)/index.js`): Pokémon of the day, quick actions, the daily challenge and quiz,
  type of the day, a fact, your team, Pokédex progress, and recently viewed and favourite Pokémon.
- **Pokédex** (`src/app/pokedex.js`): the National Dex as a two-column grid coloured by primary type.
  Pages of 60 load as you scroll, and each tile fetches its own types when it appears.
- **Pokémon** (`src/app/pokemon/[id].js`): type-coloured header with forms, shiny artwork and cry, plus
  About, Base Stats, Evolution, Moves and Locations tabs.
- **Explore**: types, regions (and their locations), moves, abilities, items, berries, TMs/HMs and natures.
- **Tools**: team matchups, stat calculator, daily challenge, "Who's that Pokémon?", compare and offline mode.
- **Search**: name or number, filtered by type, generation and stats. On the web it has its own search
  field; on iOS/Android it uses the system search bar.

## Project layout

```
src/
  app/              Routes (Expo Router). (tabs)/ holds the five tabs; the tools and the Pokédex
                    open full-screen from app/ directly.
  api/pokeapi.js    Every PokeAPI request, as TanStack Query hooks (cached aggressively).
  components/       Shared screen pieces: headers (HubBack, ScreenTitle, ColorHeader, PageWatermark),
                    grids and tiles, pickers. Grouped by feature: home/, detail/ (Pokémon tabs),
                    browse/ (Explore lists), quiz/.
    ui/             Small primitives: Chip, SectionTitle, InfoRow, StatBox, StatusMessage...
  lib/              Plain logic, no React Native UI: formatting (format.js), artwork URLs
                    (sprites.js), species, moves, types, stats, search, and the small saved stores
                    (favourites, team, recent...) built on storage.js.
  theme.js          The shared colour palette.
```

Files ending in `.web.js` replace their sibling on the web only. They keep native-only libraries
(Reanimated, expo-audio, expo-file-system, FlashList, native tabs) out of the web bundle.

## Setup

Requires Node 22.13+ or 24.3+.

```sh
yarn install
npx expo install --fix   # aligns any package with the SDK's expected versions
yarn start               # then press i / a / w
yarn test
```

## Install on a phone (PWA, works offline)

The web build is an installable, offline-capable PWA: no app store, no developer account.

```sh
yarn build:web                              # expo export + scripts/build-pwa.js -> dist/
npx serve dist                              # try it locally at http://localhost:3000
EXPO_BASE_URL=/pokemon_react yarn build:web # when hosting under a sub-path (GitHub Pages)
```

The phone needs an HTTPS URL, so host `dist/` somewhere (GitHub Pages, Netlify, Cloudflare Pages...).
For GitHub Pages: move `pwa/deploy-pwa.yml` to `.github/workflows/`, set Settings -> Pages -> Source to
"GitHub Actions", and push to `master`.

On iPhone open the URL in **Safari**, tap Share -> **Add to Home Screen**. Browse around once while
online: the app shell is cached on install, and every Pokémon, image and cry you open is cached as you
view it (`pwa/sw.js`), so it works offline afterwards. Clear the site data in Settings -> Safari to reset.

### Netlify

Root hosting, so no `EXPO_BASE_URL`. Either drag the `dist/` folder (after `yarn build:web`) onto
app.netlify.com/drop, or connect the repo with build command `yarn build:web`, publish directory
`dist`, and env var `NODE_VERSION=22`.
