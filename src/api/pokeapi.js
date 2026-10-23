import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';
import { idFromUrl } from '../lib/format';

const BASE = 'https://pokeapi.co/api/v2';
const PAGE_SIZE = 60;
// IDs above this are alternate forms (megas, regionals...), not National Dex entries.
const FORM_ID_START = 10000;

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

export function useTypes(names = []) {
  return useQueries({
    queries: names.map((name) => ({
      queryKey: ['type', name],
      queryFn: () => getJson(`${BASE}/type/${name}`),
      ...STATIC,
    })),
  });
}
