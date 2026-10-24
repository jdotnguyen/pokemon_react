import { useSyncExternalStore } from 'react';
import { FORM_ID_START, idFromUrl } from './format';
import { createStore } from './storage';

// A one-time, saved table of base stats + legendary/mythical/baby flags for every National Dex Pokémon,
// so search can sort and filter on them. Row = [hp, atk, def, spa, spd, spe, flags].
export const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
export const FLAG = { legendary: 1, mythical: 2, baby: 4 };

const BASE = 'https://pokeapi.co/api/v2';
const GRAPHQL = 'https://beta.pokeapi.co/graphql/v1beta';
const MIN_ROWS = 500; // sanity check on a download before we trust and save it

export const totalOf = (row) => row[0] + row[1] + row[2] + row[3] + row[4] + row[5];
export const statOf = (row, key) => (key === 'total' ? totalOf(row) : row[STAT_ORDER.indexOf(key)]);
export const hasFlag = (row, name) => (row[6] & FLAG[name]) !== 0;

const flagsFrom = (s) => (s?.is_legendary ? FLAG.legendary : 0) | (s?.is_mythical ? FLAG.mythical : 0) | (s?.is_baby ? FLAG.baby : 0);

/** Row from one pokemon_v2_pokemon entry of the GraphQL response (stats ordered by stat id). */
export function rowFromGraphql(p) {
  const stats = (p?.pokemon_v2_pokemonstats ?? []).map((s) => s.base_stat);
  if (stats.length < 6) return null;
  return [...stats.slice(0, 6), flagsFrom(p.pokemon_v2_pokemonspecy)];
}

/** Row from /pokemon/{id} and /pokemon-species/{id} payloads. */
export function rowFromRest(pokemon, species) {
  const byName = Object.fromEntries((pokemon?.stats ?? []).map((s) => [s.stat.name, s.base_stat]));
  if (STAT_ORDER.some((k) => byName[k] == null)) return null;
  return [...STAT_ORDER.map((k) => byName[k]), flagsFrom(species)];
}

const persisted = createStore('stat-index', { v: 1, rows: null });

let status = { state: 'idle', progress: 0, error: null };
const listeners = new Set();
const setStatus = (next) => {
  status = { ...status, ...next };
  listeners.forEach((l) => l());
};
const subscribeStatus = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

let running = false;

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.json();
}

async function downloadGraphql() {
  const query = `query { pokemon_v2_pokemon(where: {id: {_lt: ${FORM_ID_START}}}, order_by: {id: asc}) {
    id pokemon_v2_pokemonstats(order_by: {stat_id: asc}) { base_stat }
    pokemon_v2_pokemonspecy { is_legendary is_mythical is_baby } } }`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const json = await fetchJson(GRAPHQL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
    const rows = {};
    for (const p of json?.data?.pokemon_v2_pokemon ?? []) {
      const row = rowFromGraphql(p);
      if (row) rows[p.id] = row;
    }
    return rows;
  } finally {
    clearTimeout(timer);
  }
}

async function downloadRest() {
  const list = await fetchJson(`${BASE}/pokemon?limit=100000`);
  const ids = list.results.map((r) => idFromUrl(r.url)).filter((id) => id != null && id < FORM_ID_START);
  const rows = {};
  let done = 0;
  let next = 0;
  const worker = async () => {
    while (next < ids.length) {
      const id = ids[next++];
      try {
        const [pokemon, species] = await Promise.all([
          fetchJson(`${BASE}/pokemon/${id}`),
          fetchJson(`${BASE}/pokemon-species/${id}`),
        ]);
        const row = rowFromRest(pokemon, species);
        if (row) rows[id] = row;
      } catch {
        // Skip this one; the sanity check below catches a mostly-failed run.
      }
      done += 1;
      if (done % 10 === 0 || done === ids.length) setStatus({ progress: done / ids.length });
    }
  };
  await Promise.all(Array.from({ length: 12 }, worker));
  return rows;
}

async function run(download, failureState) {
  if (running || persisted.get().rows) return;
  running = true;
  setStatus({ state: 'loading', progress: 0, error: null });
  try {
    const rows = await download();
    if (Object.keys(rows).length < MIN_ROWS) throw new Error('Incomplete data');
    persisted.set({ v: 1, rows });
    setStatus({ state: 'ready', progress: 1 });
  } catch (e) {
    setStatus({ state: failureState, error: String(e?.message ?? e) });
  } finally {
    running = false;
  }
}

/**
 * Stat table for sorting/filtering. `rows` is { [id]: row } once downloaded (saved to disk).
 * `load()` tries a single fast request; if that fails, status.state becomes 'quick-failed' and
 * `loadFull()` does the one-off per-Pokémon download (about 2,000 small requests).
 */
export function useStatIndex() {
  const rows = persisted.use((s) => s.rows);
  const st = useSyncExternalStore(subscribeStatus, () => status, () => status);
  return {
    rows,
    state: rows ? 'ready' : st.state,
    progress: st.progress,
    error: st.error,
    load: () => run(downloadGraphql, 'quick-failed'),
    loadFull: () => run(downloadRest, 'failed'),
  };
}
