import { recordSeen } from './seen';
import { createStore } from './storage';

const MAX_RECENT = 12;
const store = createStore('recent', []);

/** Remember that a Pokémon was just opened (most recent first, no duplicates). */
export function recordRecent(id) {
  recordSeen(id);
  const list = store.get();
  if (list[0] === id) return;
  store.set([id, ...list.filter((x) => x !== id)].slice(0, MAX_RECENT));
}

export function useRecent() {
  return store.use();
}
