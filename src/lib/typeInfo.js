import { FORM_ID_START, idFromUrl } from './format';
import { TYPE_COLORS } from './types';

/** National Dex Pokémon of a /type/{name} response, ordered by number. */
export function dexPokemonOfType(typeData) {
  return (typeData?.pokemon ?? [])
    .map((p) => ({ id: idFromUrl(p.pokemon.url), name: p.pokemon.name }))
    .filter((p) => p.id != null && p.id < FORM_ID_START)
    .sort((a, b) => a.id - b.id);
}

export function countDexPokemon(typeData) {
  return dexPokemonOfType(typeData).length;
}

// Keep only the 18 battle types (PokeAPI also lists "stellar", "unknown" and "shadow").
const known = (list = []) => list.map((t) => t.name).filter((n) => n in TYPE_COLORS);

/** Attacking and defending matchups of a type, grouped for display. */
export function typeMatchups(typeData) {
  const r = typeData?.damage_relations;
  if (!r) return null;
  return {
    attacking: [
      { title: 'Super effective against', multiplier: '2×', types: known(r.double_damage_to) },
      { title: 'Not very effective against', multiplier: '½×', types: known(r.half_damage_to) },
      { title: 'No effect on', multiplier: '0×', types: known(r.no_damage_to) },
    ],
    defending: [
      { title: 'Weak to', multiplier: '2×', types: known(r.double_damage_from) },
      { title: 'Resists', multiplier: '½×', types: known(r.half_damage_from) },
      { title: 'Immune to', multiplier: '0×', types: known(r.no_damage_from) },
    ],
  };
}
