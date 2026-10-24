import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';
import { FORM_ID_START, idFromUrl } from '../lib/format';
import { ALL_TYPES } from '../lib/types';

const BASE = 'https://pokeapi.co/api/v2';
const PAGE_SIZE = 60;

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PokeAPI ${res.status} for ${url}`);
  return res.json();
}

// PokeAPI data is effectively static, so cache aggressively.
const STATIC = { staleTime: Infinity, gcTime: 1000 * 60 * 60 };

/** Paged National Dex list, ordered by number. Each page is fetched as you scroll. */
export function usePokedexList() {
  return useInfiniteQuery({
    queryKey: ['pokedex'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const data = await getJson(`${BASE}/pokemon?limit=${PAGE_SIZE}&offset=${pageParam}`);
      const items = data.results
        .map((r) => ({ name: r.name, id: idFromUrl(r.url) }))
        .filter((p) => p.id != null && p.id < FORM_ID_START);
      const reachedForms = items.length < data.results.length;
      const nextOffset = data.next && !reachedForms ? pageParam + PAGE_SIZE : undefined;
      return { items, nextOffset };
    },
    getNextPageParam: (last) => last.nextOffset,
    ...STATIC,
  });
}

/** Every National Dex name + id in one request (~1k small rows), for search. */
export function usePokemonIndex() {
  return useQuery({
    queryKey: ['pokedex-index'],
    queryFn: async () => {
      const data = await getJson(`${BASE}/pokemon?limit=100000`);
      return data.results
        .map((r) => ({ name: r.name, id: idFromUrl(r.url) }))
        .filter((p) => p.id != null && p.id < FORM_ID_START);
    },
    ...STATIC,
  });
}

/** Full /pokemon/{id} payload — tiles use it for types, the detail screen for everything else. */
export function usePokemon(id) {
  return useQuery({
    queryKey: ['pokemon', Number(id)],
    queryFn: () => getJson(`${BASE}/pokemon/${id}`),
    enabled: id != null,
    ...STATIC,
  });
}

export function useSpecies(id) {
  return useQuery({
    queryKey: ['species', Number(id)],
    queryFn: () => getJson(`${BASE}/pokemon-species/${id}`),
    enabled: id != null,
    ...STATIC,
  });
}

export function useEvolutionChain(url) {
  return useQuery({
    queryKey: ['evolution', url],
    queryFn: () => getJson(url),
    enabled: !!url,
    ...STATIC,
  });
}

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: async () => (await getJson(`${BASE}/region?limit=100`)).results,
    ...STATIC,
  });
}

export function useRegion(name) {
  return useQuery({
    queryKey: ['region', name],
    queryFn: () => getJson(`${BASE}/region/${name}`),
    enabled: !!name,
    ...STATIC,
  });
}

/** A regional Pokédex (e.g. "kanto", "updated-johto") with its own numbering. */
export function usePokedex(name) {
  return useQuery({
    queryKey: ['pokedex', name],
    queryFn: () => getJson(`${BASE}/pokedex/${name}`),
    enabled: !!name,
    ...STATIC,
  });
}

export function useLocation(name) {
  return useQuery({
    queryKey: ['location', name],
    queryFn: () => getJson(`${BASE}/location/${name}`),
    enabled: !!name,
    ...STATIC,
  });
}

/** Each location has one or more areas (e.g. a cave's floors); encounters live on the areas. */
export function useLocationAreas(urls = []) {
  return useQueries({
    queries: urls.map((url) => ({
      queryKey: ['location-area', url],
      queryFn: () => getJson(url),
      ...STATIC,
    })),
  });
}

export function useTypes(names = []) {
  return useQueries({
    queries: names.map((name) => ({
      queryKey: ['type', name],
      queryFn: () => getJson(`${BASE}/type/${name}`),
      ...STATIC,
    })),
  });
}

export function useMove(name) {
  return useQuery({
    queryKey: ['move', name],
    queryFn: () => getJson(`${BASE}/move/${name}`),
    enabled: !!name,
    ...STATIC,
  });
}

const DAMAGE_CLASSES = ['physical', 'special', 'status'];

// Fold the per-type and per-class move lists into one name -> { type, damageClass } map.
function combineMoveIndex(results) {
  const map = new Map();
  results.forEach((r, i) => {
    if (!r.data) return;
    const isType = i < ALL_TYPES.length;
    const label = isType ? ALL_TYPES[i] : DAMAGE_CLASSES[i - ALL_TYPES.length];
    for (const m of r.data.moves ?? []) {
      const entry = map.get(m.name) ?? {};
      entry[isType ? 'type' : 'damageClass'] = label;
      map.set(m.name, entry);
    }
  });
  return map;
}

/**
 * Type + damage class for every move, from 18 /type and 3 /move-damage-class
 * requests (cached forever) instead of one request per move. The /type
 * queries share their cache with useTypes.
 */
export function useMoveIndex() {
  return useQueries({
    queries: [
      ...ALL_TYPES.map((name) => ({
        queryKey: ['type', name],
        queryFn: () => getJson(`${BASE}/type/${name}`),
        ...STATIC,
      })),
      ...DAMAGE_CLASSES.map((name) => ({
        queryKey: ['damage-class', name],
        queryFn: () => getJson(`${BASE}/move-damage-class/${name}`),
        ...STATIC,
      })),
    ],
    combine: combineMoveIndex,
  });
}

export function useGenerations() {
  return useQuery({
    queryKey: ['generations'],
    queryFn: async () => (await getJson(`${BASE}/generation`)).results.map((g) => g.name),
    ...STATIC,
  });
}

export function useGeneration(name) {
  return useQuery({
    queryKey: ['generation', name],
    queryFn: () => getJson(`${BASE}/generation/${name}`),
    enabled: !!name,
    ...STATIC,
  });
}

/** Several /pokemon/{id} payloads at once; shares the cache with usePokemon. */
export function usePokemonList(ids = []) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['pokemon', Number(id)],
      queryFn: () => getJson(`${BASE}/pokemon/${id}`),
      ...STATIC,
    })),
  });
}

/** Wild encounters of a Pokémon across every game: /pokemon/{id}/encounters. */
export function useEncounters(id) {
  return useQuery({
    queryKey: ['encounters', Number(id)],
    queryFn: () => getJson(`${BASE}/pokemon/${id}/encounters`),
    enabled: id != null,
    ...STATIC,
  });
}

const areaLocationCache = new Map();

/** The location an area belongs to (e.g. "viridian-forest-area" -> "viridian-forest"), for linking. */
export async function locationNameOfArea(areaName) {
  if (!areaLocationCache.has(areaName)) {
    const area = await getJson(`${BASE}/location-area/${areaName}`);
    areaLocationCache.set(areaName, area.location.name);
  }
  return areaLocationCache.get(areaName);
}

/** A list endpoint (/ability, /move, /item, /berry...) as [{ name, id }] with every entry. */
function useNameList(resource, limit) {
  return useQuery({
    queryKey: ['list', resource],
    queryFn: async () => {
      const data = await getJson(`${BASE}/${resource}?limit=${limit}`);
      return data.results.map((r) => ({ name: r.name, id: idFromUrl(r.url) }));
    },
    ...STATIC,
  });
}

function useByName(resource, name) {
  return useQuery({
    queryKey: [resource, name],
    queryFn: () => getJson(`${BASE}/${resource}/${name}`),
    enabled: !!name,
    ...STATIC,
  });
}

export const useAbilityList = () => useNameList('ability', 1000);
export const useAbility = (name) => useByName('ability', name);
export const useMoveList = () => useNameList('move', 2000);
export const useItemList = () => useNameList('item', 3000);
export const useItem = (name) => useByName('item', name);
export const useBerryList = () => useNameList('berry', 100);
export const useBerry = (name) => useByName('berry', name);

/** TM / HM / TR items. */
export function useMachineItems() {
  return useQuery({
    queryKey: ['item-category', 'all-machines'],
    queryFn: async () => {
      const data = await getJson(`${BASE}/item-category/all-machines`);
      return data.items.map((i) => ({ name: i.name, id: idFromUrl(i.url) }));
    },
    ...STATIC,
  });
}

/** Resolve a list of /machine/{id} urls (a TM's per-game entries, or a move's). */
export function useMachines(urls = []) {
  return useQueries({
    queries: urls.map((url) => ({
      queryKey: ['machine', url],
      queryFn: () => getJson(url),
      ...STATIC,
    })),
  });
}

/** All natures: the list, then each nature (25 small requests, cached forever). */
export function useNatures() {
  const list = useQuery({
    queryKey: ['nature-list'],
    queryFn: async () => (await getJson(`${BASE}/nature?limit=100`)).results.map((r) => r.name),
    ...STATIC,
  });
  const natures = useQueries({
    queries: (list.data ?? []).map((name) => ({
      queryKey: ['nature', name],
      queryFn: () => getJson(`${BASE}/nature/${name}`),
      ...STATIC,
    })),
  });
  return { list, natures };
}
