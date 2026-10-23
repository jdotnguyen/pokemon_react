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
