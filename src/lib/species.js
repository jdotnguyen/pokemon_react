// Species-level helpers: evolution chains, forms (varieties), held items and status badges.
import { formatName, idFromUrl, titleCase } from './format';

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
