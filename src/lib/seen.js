import { createStore } from './storage';

// Every distinct Pokémon you've opened, for the Home progress ring.
const store = createStore('seen', []);

export function recordSeen(id) {
  const list = store.get();
  if (!list.includes(id)) store.set([...list, id]);
}

export function useSeen() {
  return store.use();
}
