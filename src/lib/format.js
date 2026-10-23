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

export function artworkUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
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

/**
 * Combine the damage relations of a Pokémon's types into a single
 * multiplier per attacking type. `typeData` is an array of /type/{name}
 * responses.
 */
export function typeDefenses(typeData = [], allTypes = []) {
  const multipliers = Object.fromEntries(allTypes.map((t) => [t, 1]));
  for (const data of typeData) {
    const rel = data?.damage_relations;
    if (!rel) continue;
    rel.double_damage_from.forEach(({ name }) => (multipliers[name] = (multipliers[name] ?? 1) * 2));
    rel.half_damage_from.forEach(({ name }) => (multipliers[name] = (multipliers[name] ?? 1) * 0.5));
    rel.no_damage_from.forEach(({ name }) => (multipliers[name] = 0));
  }
  return multipliers;
}

export function formatMultiplier(m) {
  if (m === 0.25) return '¼×';
  if (m === 0.5) return '½×';
  return `${m}×`;
}

function evolutionTrigger(details = []) {
  const d = details[0];
  if (!d) return '';
  if (d.min_level) return `Lv. ${d.min_level}`;
  if (d.item) return formatName(d.item.name);
  if (d.trigger?.name === 'trade') return d.held_item ? `Trade w/ ${formatName(d.held_item.name)}` : 'Trade';
  if (d.min_happiness) return 'Friendship';
  if (d.known_move) return `Knows ${formatName(d.known_move.name)}`;
  if (d.location) return formatName(d.location.name);
  if (d.time_of_day) return titleCase(d.time_of_day);
  return titleCase(d.trigger?.name ?? '');
}

/**
 * Flatten an evolution chain tree into from -> to pairs, which handles
 * branching chains (Eevee, Oddish...) without special cases.
 */
export function evolutionPairs(chain) {
  const pairs = [];
  const walk = (node) => {
    if (!node) return;
    const from = { name: node.species.name, id: idFromUrl(node.species.url) };
    for (const next of node.evolves_to ?? []) {
      pairs.push({
        from,
        to: { name: next.species.name, id: idFromUrl(next.species.url) },
        trigger: evolutionTrigger(next.evolution_details),
      });
      walk(next);
    }
  };
  walk(chain);
  return pairs;
}

/**
 * Level-up moves from the most recent version group the Pokémon
 * has level-up data for, sorted by level.
 */
export function levelUpMoves(moves = []) {
  let latestGroup = -1;
  for (const m of moves) {
    for (const v of m.version_group_details) {
      if (v.move_learn_method.name === 'level-up') {
        latestGroup = Math.max(latestGroup, idFromUrl(v.version_group.url) ?? -1);
      }
    }
  }
  const result = [];
  for (const m of moves) {
    const detail = m.version_group_details.find(
      (v) => v.move_learn_method.name === 'level-up' && idFromUrl(v.version_group.url) === latestGroup
    );
    if (detail) result.push({ name: m.move.name, level: detail.level_learned_at });
  }
  return result.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
}
