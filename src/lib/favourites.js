import { useSyncExternalStore } from 'react';

// Tiny in-memory favourites store (resets on reload). Swap for
// AsyncStorage-backed persistence when the Favourites screen lands.
let favourites = new Set();
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toggleFavourite(id) {
  const next = new Set(favourites);
  next.has(id) ? next.delete(id) : next.add(id);
  favourites = next;
  listeners.forEach((l) => l());
}

/** The current Set of favourite ids (a new Set each time it changes). */
export function useFavourites() {
  return useSyncExternalStore(
    subscribe,
    () => favourites,
    () => favourites
  );
}

export function useIsFavourite(id) {
  return useSyncExternalStore(
    subscribe,
    () => favourites.has(id),
    () => false
  );
}
