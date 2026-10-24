import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';

// Small JSON persistence: files in the app's document directory on native, localStorage on web.
// Everything falls back to memory if storage is unavailable, so the app never depends on it.
const memory = new Map();
const writeChains = new Map();

const fileFor = (key) => new File(Paths.document, `pokedex-${key}.json`);

export async function loadJson(key, fallback) {
  try {
    if (Platform.OS === 'web') {
      const raw = globalThis.localStorage?.getItem(`pokedex-${key}`);
      return raw ? JSON.parse(raw) : fallback;
    }
    const file = fileFor(key);
    if (!file.exists) return fallback;
    return JSON.parse(await file.text());
  } catch {
    return memory.has(key) ? memory.get(key) : fallback;
  }
}

/** Fire-and-forget save. Writes to the same key are queued so they land in order. */
export function saveJson(key, value) {
  memory.set(key, value);
  const json = JSON.stringify(value);
  const previous = writeChains.get(key) ?? Promise.resolve();
  const next = previous.then(async () => {
    try {
      if (Platform.OS === 'web') {
        globalThis.localStorage?.setItem(`pokedex-${key}`, json);
        return;
      }
      const file = fileFor(key);
      if (!file.exists) file.create();
      await file.write(json);
    } catch {
      // Best effort: the in-memory copy still works for this session.
    }
  });
  writeChains.set(key, next);
  return next;
}

/**
 * A tiny persisted store. State is always an immutable value; call `set` with a new one.
 * It starts with `initial`, swaps in the saved value once it has loaded (unless something
 * has already changed it), and saves on every change.
 */
export function createStore(key, initial, revive = (v) => v) {
  let state = initial;
  let changed = false;
  const listeners = new Set();
  const notify = () => listeners.forEach((l) => l());

  loadJson(key, null).then((saved) => {
    if (saved != null && !changed) {
      state = revive(saved);
      notify();
    }
  });

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    get: () => state,
    subscribe,
    set(next) {
      changed = true;
      state = next;
      saveJson(key, next);
      notify();
    },
    use: (selector = (s) => s) => useSyncExternalStore(subscribe, () => selector(state), () => selector(state)),
  };
}
