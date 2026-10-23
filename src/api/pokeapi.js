import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';
import { FORM_ID_START, idFromUrl } from '../lib/format';

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
