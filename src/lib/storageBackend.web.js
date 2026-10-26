// Web persistence: localStorage. Kept separate so the web bundle doesn't include expo-file-system.
export async function readRaw(key) {
  return globalThis.localStorage?.getItem(`pokedex-${key}`) ?? null;
}

export async function writeRaw(key, json) {
  globalThis.localStorage?.setItem(`pokedex-${key}`, json);
}
