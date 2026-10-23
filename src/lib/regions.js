import { formatName, idFromUrl } from './format';

// Cards get a fixed colour per region; unknown future regions cycle through FALLBACK.
const REGION_COLORS = {
  kanto: '#FB6C6C',
  johto: '#E8B23A',
  hoenn: '#48D0B0',
  sinnoh: '#77BDFE',
  unova: '#6F6A75',
  kalos: '#F67FA1',
  alola: '#E0865A',
  galar: '#A974BC',
  hisui: '#7B8FB3',
  paldea: '#D96A5A',
};
const FALLBACK = ['#7469E0', '#9CC24B', '#6FD3E6', '#D9B46B'];

export function regionColor(name, index = 0) {
  return REGION_COLORS[name] ?? FALLBACK[index % FALLBACK.length];
}

// The three starters each region is known for, shown on its card.
const REGION_STARTERS = {
  kanto: [1, 4, 7],
  johto: [152, 155, 158],
  hoenn: [252, 255, 258],
  sinnoh: [387, 390, 393],
  unova: [495, 498, 501],
  kalos: [650, 653, 656],
  alola: [722, 725, 728],
  galar: [810, 813, 816],
  hisui: [722, 155, 501],
  paldea: [906, 909, 912],
};

export function regionStarters(name) {
  return REGION_STARTERS[name] ?? [];
}

// "generation-iv" -> "Generation IV"
export function generationLabel(slug) {
  if (!slug) return '';
  const numeral = slug.replace(/^generation-/, '');
  return `Generation ${numeral.toUpperCase()}`;
}

const VERSION_GROUP_NAMES = {
  'red-blue': 'Red & Blue',
  'firered-leafgreen': 'FireRed & LeafGreen',
  'heartgold-soulsilver': 'HeartGold & SoulSilver',
  'black-2-white-2': 'Black 2 & White 2',
  'x-y': 'X & Y',
  'omega-ruby-alpha-sapphire': 'Omega Ruby & Alpha Sapphire',
  'sun-moon': 'Sun & Moon',
  'ultra-sun-ultra-moon': 'Ultra Sun & Ultra Moon',
  'lets-go-pikachu-lets-go-eevee': "Let's Go Pikachu & Eevee",
  'sword-shield': 'Sword & Shield',
  'brilliant-diamond-and-shining-pearl': 'Brilliant Diamond & Shining Pearl',
  'legends-arceus': 'Legends: Arceus',
  'scarlet-violet': 'Scarlet & Violet',
  'legends-za': 'Legends: Z-A',
  xd: 'XD',
};

// Two-version groups ("gold-silver") read as "Gold & Silver".
export function versionGroupLabel(slug) {
  if (VERSION_GROUP_NAMES[slug]) return VERSION_GROUP_NAMES[slug];
  const parts = slug.split('-');
  if (parts.length === 2) return `${formatName(parts[0])} & ${formatName(parts[1])}`;
  return formatName(slug);
}

export const VERSION_NAMES = {
  firered: 'FireRed',
  leafgreen: 'LeafGreen',
  heartgold: 'HeartGold',
  soulsilver: 'SoulSilver',
  'black-2': 'Black 2',
  'white-2': 'White 2',
  'omega-ruby': 'Omega Ruby',
  'alpha-sapphire': 'Alpha Sapphire',
  'lets-go-pikachu': "Let's Go Pikachu",
  'lets-go-eevee': "Let's Go Eevee",
  'brilliant-diamond': 'Brilliant Diamond',
  'shining-pearl': 'Shining Pearl',
};

export function versionLabel(slug) {
  return VERSION_NAMES[slug] ?? formatName(slug);
}

// "kanto-route-1" -> "Route 1" when shown inside Kanto.
export function locationLabel(slug, regionName) {
  const stripped = regionName && slug.startsWith(`${regionName}-`) ? slug.slice(regionName.length + 1) : slug;
  return formatName(stripped);
}

// "mt-moon-b1f" inside "mt-moon" -> "B1F"; the default area reads as "Main area".
export function areaLabel(areaSlug, locationSlug) {
  if (areaSlug === locationSlug || areaSlug === `${locationSlug}-area`) return 'Main area';
  const stripped = areaSlug.startsWith(`${locationSlug}-`) ? areaSlug.slice(locationSlug.length + 1) : areaSlug;
  return stripped
    .split('-')
    .map((p) => (/^b?\d+f$/i.test(p) ? p.toUpperCase() : formatName(p)))
    .join(' ');
}

/**
 * Collapse a location area's encounter data (per Pokémon, per version, per
 * method/level slot) into one row per Pokémon.
 */
export function summarizeEncounters(area) {
  const rows = [];
  for (const enc of area?.pokemon_encounters ?? []) {
    const versions = new Set();
    const methods = new Set();
    let minLevel = Infinity;
    let maxLevel = -Infinity;
    let chance = 0;
    for (const vd of enc.version_details) {
      versions.add(vd.version.name);
      chance = Math.max(chance, vd.max_chance ?? 0);
      for (const d of vd.encounter_details) {
        methods.add(d.method.name);
        minLevel = Math.min(minLevel, d.min_level);
        maxLevel = Math.max(maxLevel, d.max_level);
      }
    }
    rows.push({
      id: idFromUrl(enc.pokemon.url),
      name: enc.pokemon.name,
      versions: [...versions],
      methods: [...methods],
      minLevel: Number.isFinite(minLevel) ? minLevel : null,
      maxLevel: Number.isFinite(maxLevel) ? maxLevel : null,
      chance,
    });
  }
  return rows.sort((a, b) => a.id - b.id);
}

export function levelRange(min, max) {
  if (min == null) return '';
  return min === max ? `Lv. ${min}` : `Lv. ${min}–${max}`;
}
