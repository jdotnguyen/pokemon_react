// Card / header colours per type, tuned to the soft palette in the design.
export const TYPE_COLORS = {
  normal: '#A4ACAF',
  fire: '#FB6C6C',
  water: '#77BDFE',
  electric: '#FFCE4B',
  grass: '#48D0B0',
  ice: '#6FD3E6',
  fighting: '#E0865A',
  poison: '#A974BC',
  ground: '#D9B46B',
  flying: '#8FA8DD',
  psychic: '#F67FA1',
  bug: '#9CC24B',
  rock: '#BFAE6E',
  ghost: '#7B6CB3',
  dragon: '#7469E0',
  dark: '#6F6A75',
  steel: '#9FB4C4',
  fairy: '#EE99C9',
};

export const ALL_TYPES = Object.keys(TYPE_COLORS);

export const NEUTRAL_COLOR = '#C9D1D8';

export function typeColor(type) {
  return TYPE_COLORS[type] ?? NEUTRAL_COLOR;
}

// Primary (slot 1) type colour for a Pokémon's types array.
export function primaryColor(types) {
  return typeColor(types?.[0]);
}
