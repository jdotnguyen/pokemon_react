import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { FORM_ID_START, idFromUrl } from './format';
import { createStore } from './storage';
import { ALL_TYPES } from './types';
import { artworkUrl, itemSpriteUrl } from './sprites';

// "Download everything": walks every PokeAPI endpoint the app uses, plus (optionally) artwork, item
// sprites and cries, and pulls each through the service worker (pwa/sw.js), which stores it. After
// that the whole app runs from the device. Web/PWA only: native builds have no service worker.
//
// The URLs here must match the ones in src/api/pokeapi.js exactly, because the cache is keyed by URL.
// Safe to stop and restart: anything already cached is skipped.

const API = 'https://pokeapi.co/api/v2';
const PAGE_SIZE = 60; // keep in step with usePokedexList
const CONCURRENCY = 6;
const MEDIA_CONCURRENCY = 8;
const CRY = (id) => `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;

export const offlineSupported =
  Platform.OS === 'web' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator && typeof caches !== 'undefined';

/** The service worker only caches pages it controls, i.e. after the first reload following install. */
export const serviceWorkerReady = () => offlineSupported && !!navigator.serviceWorker.controller;

// Same names as in pwa/sw.js.
function cacheNameFor(url) {
  if (url.startsWith(API)) return 'pokedex-api-v1';
  return /\.(ogg|mp3|wav|m4a)$/i.test(url) ? 'pokedex-audio-v1' : 'pokedex-img-v1';
}

/** Persisted summary of the last completed download. */
export const offlinePack = createStore('offline-pack', { v: 1, completedAt: null, withMedia: false, failed: 0 });

let status = { state: 'idle', phase: '', done: 0, total: 0, failed: 0, message: null };
const listeners = new Set();
let notifyTimer = null;
const notifyNow = () => listeners.forEach((l) => l());
function notifySoon() {
  if (notifyTimer) return;
  notifyTimer = setTimeout(() => {
    notifyTimer = null;
    notifyNow();
  }, 150);
}
function update(patch, immediate = true) {
  status = { ...status, ...patch };
  immediate ? notifyNow() : notifySoon();
}
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useOfflineStatus = () => useSyncExternalStore(subscribe, () => status, () => status);

let cancelled = false;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const addTotal = (n) => update({ total: status.total + n }, false);
const tick = () => update({ done: status.done + 1 }, false);

async function isCached(url) {
  try {
    return !!(await (await caches.open(cacheNameFor(url))).match(url));
  } catch {
    return false;
  }
}

/**
 * Fetch `url` through the service worker so it gets cached. With `parse`, returns the JSON (needed to
 * discover more URLs); otherwise the body is just drained and null is returned.
 */
async function pull(url, parse = false) {
  if (!parse && (await isCached(url))) {
    tick();
    return null;
  }
  for (let attempt = 0; attempt < 3 && !cancelled; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) {
        tick(); // nothing to cache; not worth failing the run over
        return null;
      }
      if (!res.ok) throw new Error(`${res.status}`);
      let out = null;
      if (parse) out = await res.json();
      else await res.arrayBuffer();
      tick();
      return out;
    } catch {
      await sleep(600 * (attempt + 1));
    }
  }
  if (!cancelled) update({ done: status.done + 1, failed: status.failed + 1 }, false);
  return null;
}

async function pool(items, worker, concurrency = CONCURRENCY) {
  let next = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (!cancelled) {
      const i = next++;
      if (i >= items.length) return;
      await worker(items[i]);
    }
  });
  await Promise.all(runners);
}

const namesOf = (list) => (list?.results ?? []).map((r) => r.name);

async function downloadAll(withMedia) {
  // 1. Lists and small reference tables
  update({ phase: 'Lists' });
  const listUrls = {
    index: `${API}/pokemon?limit=100000`,
    region: `${API}/region?limit=100`,
    generation: `${API}/generation`,
    nature: `${API}/nature?limit=100`,
    ability: `${API}/ability?limit=1000`,
    move: `${API}/move?limit=2000`,
    item: `${API}/item?limit=3000`,
    berry: `${API}/berry?limit=100`,
  };
  const reference = [
    `${API}/item-category/all-machines`,
    ...ALL_TYPES.map((t) => `${API}/type/${t}`),
    ...['physical', 'special', 'status'].map((c) => `${API}/move-damage-class/${c}`),
  ];
  addTotal(Object.keys(listUrls).length + reference.length);
  const lists = {};
  await pool(Object.entries(listUrls), async ([key, url]) => {
    lists[key] = await pull(url, true);
  });
  await pool(reference, (url) => pull(url));
  if (cancelled) return;
  if (!lists.index) throw new Error("Couldn't reach PokeAPI. Check your connection and try again.");

  const ids = lists.index.results.map((r) => idFromUrl(r.url)).filter((id) => id != null && id < FORM_ID_START);
  const offsets = Array.from({ length: Math.ceil(ids.length / PAGE_SIZE) }, (_, i) => i * PAGE_SIZE);

  // 2. Every Pokémon: details, species, encounters (and discover evolution chains + alternate forms)
  update({ phase: 'Pokémon' });
  addTotal(offsets.length + ids.length * 3);
  const chains = new Set();
  const formIds = new Set();
  await pool(offsets, (o) => pull(`${API}/pokemon?limit=${PAGE_SIZE}&offset=${o}`));
  await pool(ids, async (id) => {
    const species = await pull(`${API}/pokemon-species/${id}`, true);
    await pull(`${API}/pokemon/${id}`);
    await pull(`${API}/pokemon/${id}/encounters`);
    if (species?.evolution_chain?.url) chains.add(species.evolution_chain.url);
    for (const v of species?.varieties ?? []) {
      const formId = idFromUrl(v.pokemon?.url);
      if (!v.is_default && formId != null) formIds.add(formId);
    }
  });
  if (cancelled) return;

  update({ phase: 'Evolutions and forms' });
  addTotal(chains.size + formIds.size);
  await pool([...chains], (url) => pull(url));
  await pool([...formIds], (id) => pull(`${API}/pokemon/${id}`));
  if (cancelled) return;

  // 3. Moves, items, abilities, berries, natures, generations
  update({ phase: 'Moves and items' });
  const moves = namesOf(lists.move);
  const items = namesOf(lists.item);
  const abilities = namesOf(lists.ability);
  const berries = namesOf(lists.berry);
  const natures = namesOf(lists.nature);
  const generations = namesOf(lists.generation);
  addTotal(moves.length + items.length + abilities.length + berries.length + natures.length + generations.length);
  const machines = new Set();
  const sprites = new Set();
  await pool(moves, async (n) => {
    const m = await pull(`${API}/move/${n}`, true);
    for (const x of m?.machines ?? []) machines.add(x.machine.url);
  });
  await pool(items, async (n) => {
    const it = await pull(`${API}/item/${n}`, true);
    for (const x of it?.machines ?? []) machines.add(x.machine.url);
    if (it?.sprites?.default) sprites.add(it.sprites.default);
  });
  await pool(abilities, (n) => pull(`${API}/ability/${n}`));
  await pool(berries, (n) => pull(`${API}/berry/${n}`));
  await pool(natures, (n) => pull(`${API}/nature/${n}`));
  await pool(generations, (n) => pull(`${API}/generation/${n}`));
  if (cancelled) return;

  update({ phase: 'TMs and HMs' });
  addTotal(machines.size);
  await pool([...machines], (url) => pull(url));
  if (cancelled) return;

  // 4. Regions, regional Pokédexes, locations and their areas
  update({ phase: 'Regions and locations' });
  const regions = namesOf(lists.region);
  addTotal(regions.length);
  const pokedexes = new Set();
  const locations = new Set();
  await pool(regions, async (n) => {
    const r = await pull(`${API}/region/${n}`, true);
    for (const p of r?.pokedexes ?? []) pokedexes.add(p.name);
    for (const l of r?.locations ?? []) locations.add(l.name);
  });
  addTotal(pokedexes.size + locations.size);
  await pool([...pokedexes], (n) => pull(`${API}/pokedex/${n}`));
  const areaUrls = new Set();
  await pool([...locations], async (n) => {
    const loc = await pull(`${API}/location/${n}`, true);
    for (const a of loc?.areas ?? []) {
      areaUrls.add(a.url); // used by the region screens
      areaUrls.add(`${API}/location-area/${a.name}`); // used when linking an encounter to its location
    }
  });
  addTotal(areaUrls.size);
  await pool([...areaUrls], (url) => pull(url));
  if (cancelled) return;

  // 5. Optional media: artwork, item sprites, cries
  if (withMedia) {
    update({ phase: 'Artwork, sprites and cries' });
    const media = [
      ...ids.map(artworkUrl),
      ...[...formIds].map(artworkUrl),
      ...ids.map(CRY),
      ...[...sprites],
      ...berries.map((b) => itemSpriteUrl(`${b}-berry`)),
    ];
    addTotal(media.length);
    await pool(media, (url) => pull(url), MEDIA_CONCURRENCY);
  }
}

export async function startOffline({ withMedia }) {
  if (status.state === 'running') return;
  if (!serviceWorkerReady()) {
    update({
      state: 'error',
      message: 'Offline support is still starting. Close the app, reopen it once, and try again.',
    });
    return;
  }
  cancelled = false;
  update({ state: 'running', phase: 'Lists', done: 0, total: 0, failed: 0, message: null });
  try {
    await downloadAll(withMedia);
    if (cancelled) {
      update({ state: 'paused' });
      return;
    }
    offlinePack.set({ v: 1, completedAt: Date.now(), withMedia, failed: status.failed });
    update({ state: 'done', phase: '' });
  } catch (e) {
    update({ state: 'error', message: String(e?.message ?? e) });
  }
}

export function pauseOffline() {
  cancelled = true;
}
