import { FORM_ID_START, formatName, idFromUrl, titleCase } from './format';

// "tm01" -> "TM01", "hm05" -> "HM05"
export function machineLabel(slug = '') {
  return slug.toUpperCase();
}

/** Clean an API effect string: fill in $effect_chance and collapse stray whitespace. */
export function cleanEffect(text, chance) {
  if (!text) return null;
  return text
    .replace(/\$effect_chance/g, chance == null ? '' : String(chance))
    .replace(/[\f\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Pokémon rows from an ability / move / item response, as { id, name, note }. National Dex only. */
export function dexRows(list = [], noteOf) {
  return list
    .map((entry) => {
      const mon = entry.pokemon ?? entry;
      return { id: idFromUrl(mon.url), name: mon.name, note: noteOf ? noteOf(entry) : null };
    })
    .filter((p) => p.id != null && p.id < FORM_ID_START)
    .sort((a, b) => a.id - b.id);
}

/** Which stat a nature raises and lowers (both null for neutral natures). */
export function natureEffect(nature) {
  return {
    up: nature?.increased_stat?.name ?? null,
    down: nature?.decreased_stat?.name ?? null,
  };
}

const STAT_SHORT = {
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
  hp: 'HP',
};

export function statShort(slug) {
  return STAT_SHORT[slug] ?? titleCase(slug);
}

/** Berry flavours with any potency, strongest first. */
export function berryFlavors(berry) {
  return (berry?.flavors ?? [])
    .filter((f) => f.potency > 0)
    .map((f) => ({ flavor: f.flavor.name, potency: f.potency }))
    .sort((a, b) => b.potency - a.potency);
}

/** Pokédex entries as [{ version, text }] in game order, de-duplicated by version. */
export function flavorEntries(entries = []) {
  const seen = new Set();
  const out = [];
  for (const e of entries) {
    if (e.language?.name !== 'en') continue;
    const version = e.version?.name;
    if (!version || seen.has(version)) continue;
    seen.add(version);
    out.push({ version, text: cleanFlavor(e.flavor_text) });
  }
  return out;
}

export function cleanFlavor(raw = '') {
  return raw.replace(/[\f\n\r­]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function itemLabel(slug) {
  return formatName(slug);
}
