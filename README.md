# pokemon_react

A Pokédex built on [PokeAPI](https://pokeapi.co) with Expo SDK 58 and Expo Router.

- **Tabs** (`src/app/(tabs)/_layout.js`): the system tab bar via Expo Router native tabs — floating Liquid Glass on iOS 26+, Material bottom navigation on Android. Pokédex, Favourites and Search (the separate glass search button on iOS 26).
- **List** (`src/app/(tabs)/index.js`): two-column tiles coloured by primary type, ordered by National Dex number. Uses `FlashList`, so only the tiles on screen are rendered. Pages of 60 load as you scroll, and each tile fetches its own types when it appears.
- **Detail** (`src/app/pokemon/[id].js`): type-coloured header with the About, Base Stats (including type defenses), Evolution and Moves tabs.
- Data fetching and caching use TanStack Query (`src/api/pokeapi.js`).

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
