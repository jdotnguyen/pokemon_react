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
  return movesByMethod(moves, 'level-up');
}

// Shiny official artwork lives under a /shiny subfolder, keyed by the same id.
export function shinyArtworkUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
}

export function itemSpriteUrl(name) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${name}.png`;
}

/**
 * Pick the artwork for a Pokémon payload, preferring what the API says it has
 * and falling back to the conventional sprite URL. Returns null for shiny when
 * the form has no shiny artwork.
 */
export function pickArtwork(pokemon, id, shiny = false) {
  const art = pokemon?.sprites?.other?.['official-artwork'];
  if (shiny) return art?.front_shiny ?? (pokemon ? null : shinyArtworkUrl(id));
  return art?.front_default ?? artworkUrl(id);
}

/** A species' varieties as { id, name, label, isDefault }, default form first. */
export function speciesVarieties(species) {
  const list = (species?.varieties ?? []).map((v) => ({
    id: idFromUrl(v.pokemon.url),
    name: v.pokemon.name,
    isDefault: v.is_default,
  }));
  list.sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.id - b.id);
  return list.map((v) => ({ ...v, label: varietyLabel(species.name, v.name, v.isDefault) }));
}

// "raichu-alola" (species "raichu") -> "Alola"; the default form -> "Normal".
export function varietyLabel(speciesName, varietyName, isDefault = false) {
  if (isDefault || varietyName === speciesName) return 'Normal';
  const rest = varietyName.startsWith(`${speciesName}-`)
    ? varietyName.slice(speciesName.length + 1)
    : varietyName;
  return titleCase(rest);
}

/** Held items as { name, rarity } using the most recent game's drop chance. */
export function heldItems(held = []) {
  return held.map((h) => ({
    name: h.item.name,
    rarity: h.version_details?.[h.version_details.length - 1]?.rarity ?? null,
  }));
}

/** Short status labels for legendary / mythical / baby Pokémon. */
export function speciesBadges(species) {
  const badges = [];
  if (species?.is_legendary) badges.push('Legendary');
  if (species?.is_mythical) badges.push('Mythical');
  if (species?.is_baby) badges.push('Baby');
  return badges;
}

// Pick the cry URL: current games first, falling back to the legacy recording.
export function cryUrl(pokemon) {
  return pokemon?.cries?.latest ?? pokemon?.cries?.legacy ?? null;
}

/**
 * Side-by-side stat comparison. `a`/`b` are `pokemon.stats` arrays.
 * Each row has a `winner` of 'a', 'b', or null for a tie.
 */
export function compareStats(a = [], b = []) {
  const bByName = Object.fromEntries(b.map((s) => [s.stat.name, s.base_stat]));
  const winnerOf = (x, y) => (x === y ? null : x > y ? 'a' : 'b');
  const rows = a.map((s) => {
    const av = s.base_stat;
    const bv = bByName[s.stat.name] ?? 0;
    return {
      key: s.stat.name,
      label: STAT_LABELS[s.stat.name] ?? formatName(s.stat.name),
      a: av,
      b: bv,
      winner: winnerOf(av, bv),
    };
  });
  const sum = (list) => list.reduce((t, s) => t + s.base_stat, 0);
  const total = { key: 'total', label: 'Total', a: sum(a), b: sum(b), winner: winnerOf(sum(a), sum(b)) };
  const tally = {
    a: rows.filter((r) => r.winner === 'a').length,
    b: rows.filter((r) => r.winner === 'b').length,
  };
  return { rows, total, tally };
}

/** How hard each of the attacker's types hits a defender, given the defender's multiplier map. */
export function matchupMultipliers(attackerTypes = [], defenderMultipliers = {}) {
  return attackerTypes.map((type) => ({ type, multiplier: defenderMultipliers[type] ?? 1 }));
}

// Name ("char") or number ("4", "#004") search over { name, id } entries.
export function matchesQuery(item, query) {
  const q = query.trim().toLowerCase().replace(/^#/, '');
  if (!q) return true;
  if (/^\d+$/.test(q)) return String(item.id).startsWith(String(Number(q)));
  return item.name.includes(q.replace(/\s+/g, '-')) || formatName(item.name).toLowerCase().includes(q);
}

export const LEARN_METHODS = [
  { key: 'level-up', label: 'Level up' },
  { key: 'machine', label: 'TM / HM' },
  { key: 'egg', label: 'Egg' },
  { key: 'tutor', label: 'Tutor' },
];

/**
 * Moves learned a given way, from the most recent version group that has any
 * for that method. Sorted by level (0 = on evolution / not level based), then name.
 */
export function movesByMethod(moves = [], method) {
  let latestGroup = -1;
  for (const m of moves) {
    for (const v of m.version_group_details) {
      if (v.move_learn_method.name === method) {
        latestGroup = Math.max(latestGroup, idFromUrl(v.version_group.url) ?? -1);
      }
    }
  }
  if (latestGroup < 0) return [];
  const result = [];
  for (const m of moves) {
    const detail = m.version_group_details.find(
      (v) => v.move_learn_method.name === method && idFromUrl(v.version_group.url) === latestGroup
    );
    if (detail) result.push({ name: m.move.name, level: detail.level_learned_at });
  }
  return result.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
}

/** Learn methods this Pokémon actually has moves for, in display order. */
export function availableMethods(moves = []) {
  return LEARN_METHODS.filter((m) => movesByMethod(moves, m.key).length > 0);
}

/** Short English effect text of a /move response, with $effect_chance filled in. */
export function moveEffect(move) {
  const entry = move?.effect_entries?.find((e) => e.language?.name === 'en');
  const text = entry?.short_effect;
  if (!text) return null;
  return text.replace(/\$effect_chance/g, String(move.effect_chance ?? ''));
}
