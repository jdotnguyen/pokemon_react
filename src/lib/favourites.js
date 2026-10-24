import { useSyncExternalStore } from 'react';
import { createStore } from './storage';

// Favourites are saved to disk as an array of ids; screens get a Set.
const store = createStore('favourites', []);

let cachedArray = null;
let cachedSet = new Set();
function getSet() {
  const array = store.get();
  if (array !== cachedArray) {
    cachedArray = array;
    cachedSet = new Set(array);
  }
  return cachedSet;
}

export function toggleFavourite(id) {
  const array = store.get();
  store.set(array.includes(id) ? array.filter((x) => x !== id) : [...array, id]);
}

/** The current Set of favourite ids (a new Set each time it changes). */
export function useFavourites() {
  return useSyncExternalStore(store.subscribe, getSet, getSet);
}

export function useIsFavourite(id) {
  return useSyncExternalStore(
    store.subscribe,
    () => getSet().has(id),
    () => false
  );
}
