// Pure helpers for turning PokeAPI payloads into display values.

const SPECIAL_NAMES = {
  'nidoran-f': 'Nidoran♀',
  'nidoran-m': 'Nidoran♂',
  'mr-mime': 'Mr. Mime',
  'mime-jr': 'Mime Jr.',
  'mr-rime': 'Mr. Rime',
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  'type-null': 'Type: Null',
  'ho-oh': 'Ho-Oh',
  'porygon-z': 'Porygon-Z',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  flabebe: 'Flabébé',
};

// IDs above this are alternate forms (megas, regionals...), not National Dex entries.
export const FORM_ID_START = 10000;

export function titleCase(slug = '') {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatName(slug = '') {
  return SPECIAL_NAMES[slug] ?? titleCase(slug);
}

export function padId(id) {
  return `#${String(id).padStart(3, '0')}`;
}

// PokeAPI resource URLs end in /<id>/
export function idFromUrl(url = '') {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

// Height comes in decimetres.
export function formatHeight(decimetres) {
  const cm = decimetres * 10;
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}" (${(cm / 100).toFixed(2)} m)`;
}

// Weight comes in hectograms.
export function formatWeight(hectograms) {
  const kg = hectograms / 10;
  const lbs = kg * 2.20462;
  return `${lbs.toFixed(1)} lbs (${kg.toFixed(1)} kg)`;
}

// gender_rate is the chance of being female in eighths; -1 means genderless.
export function genderRatio(genderRate) {
  if (genderRate == null || genderRate < 0) return null;
  const female = (genderRate / 8) * 100;
  return { male: 100 - female, female };
}

export function formatPercent(value) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

export const STAT_LABELS = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

export function englishEntry(entries = [], key) {
  const entry = entries.find((e) => e.language?.name === 'en');
  return entry ? entry[key] : undefined;
}

// "Seed Pokémon" -> "Seed"
export function speciesLabel(genus = '') {
  return genus.replace(/\s*Pokémon$/i, '');
}

export function formatMultiplier(m) {
  if (m === 0.25) return '¼×';
  if (m === 0.5) return '½×';
  return `${m}×`;
}

