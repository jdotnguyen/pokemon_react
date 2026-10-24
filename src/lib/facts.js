import { englishEntry, formatHeight, formatName, formatWeight, speciesLabel, STAT_LABELS } from './format';
import { generationLabel } from './regions';

/** "Did you know?" lines about one Pokémon, built from its /pokemon and /pokemon-species payloads. */
export function factsFor(pokemon, species) {
  if (!pokemon) return [];
  const name = formatName(pokemon.name);
  const facts = [];

  const genus = speciesLabel(englishEntry(species?.genera, 'genus') ?? '');
  if (genus) facts.push(`${name} is known as the ${genus} Pokémon.`);

  facts.push(`${name} is ${formatHeight(pokemon.height)} tall and weighs ${formatWeight(pokemon.weight)}.`);

  if (pokemon.stats?.length) {
    const total = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
    const best = pokemon.stats.reduce((a, b) => (b.base_stat > a.base_stat ? b : a));
    const label = STAT_LABELS[best.stat.name] ?? formatName(best.stat.name);
    facts.push(`${name}'s best stat is ${label} at ${best.base_stat}, out of a base stat total of ${total}.`);
  }

  const regular = pokemon.abilities?.filter((a) => !a.is_hidden) ?? [];
  const hidden = pokemon.abilities?.find((a) => a.is_hidden);
  if (regular.length) facts.push(`${name} can have the ability ${formatName(regular[0].ability.name)}.`);
  if (hidden) facts.push(`${name}'s hidden ability is ${formatName(hidden.ability.name)}.`);

  if (species?.generation) facts.push(`${name} first appeared in ${generationLabel(species.generation.name)}.`);
  if (species?.capture_rate != null) facts.push(`${name} has a catch rate of ${species.capture_rate} out of 255.`);
  if (species?.is_legendary) facts.push(`${name} is a Legendary Pokémon.`);
  if (species?.is_mythical) facts.push(`${name} is a Mythical Pokémon.`);

  const groups = species?.egg_groups?.map((g) => formatName(g.name));
  if (groups?.length) facts.push(`${name} is in the ${groups.join(' and ')} egg group${groups.length > 1 ? 's' : ''}.`);

  return facts;
}
