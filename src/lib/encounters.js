import { formatName, idFromUrl, titleCase } from './format';

const METHOD_LABELS = { walk: 'Walking', surf: 'Surfing' };

export function methodLabel(slug) {
  return METHOD_LABELS[slug] ?? formatName(slug);
}

// "time-morning" -> "Morning", "swarm-yes" -> "Swarm", "swarm-no" -> "No swarm", "radar-on" -> "Radar"
export function conditionLabel(slug = '') {
  const yes = slug.match(/^(.*)-(yes|on)$/);
  if (yes) return titleCase(yes[1]);
  const no = slug.match(/^(.*)-(no|off)$/);
  if (no) return `No ${titleCase(no[1]).toLowerCase()}`;
  return titleCase(slug.replace(/^(time|season|weather)-/, ''));
}

const REGION_PREFIX = /^(kanto|johto|hoenn|sinnoh|unova|kalos|alola|galar|paldea|hisui)-/;

// "kanto-route-2-south-towards-viridian-city-area" -> "Route 2 South Towards Viridian City"
export function encounterAreaLabel(slug = '') {
  return slug
    .replace(/-area$/, '')
    .replace(REGION_PREFIX, '')
    .split('-')
    .map((p) => (/^b?\d+f$/i.test(p) ? p.toUpperCase() : formatName(p)))
    .join(' ');
}

/**
 * Turn a /pokemon/{id}/encounters response into per-game data:
 * [{ name, id, areas: [{ area, entries: [{ method, conditions, minLevel, maxLevel, chance }] }] }]
 * ordered by game release (version id). Slots that share a method and condition set have
 * their chances summed; each area's entries and the areas themselves are ordered by chance.
 */
export function groupEncountersByVersion(encounters = []) {
  const versions = new Map();

  for (const enc of encounters) {
    const area = enc.location_area.name;
    for (const vd of enc.version_details) {
      const key = vd.version.name;
      if (!versions.has(key)) versions.set(key, { name: key, id: idFromUrl(vd.version.url), areas: new Map() });
      const version = versions.get(key);

      const slots = new Map();
      for (const d of vd.encounter_details) {
        const conditions = (d.condition_values ?? []).map((c) => c.name).sort();
        const slotKey = `${d.method.name}|${conditions.join(',')}`;
        const slot = slots.get(slotKey) ?? {
          method: d.method.name,
          conditions,
          minLevel: Infinity,
          maxLevel: -Infinity,
          chance: 0,
        };
        slot.minLevel = Math.min(slot.minLevel, d.min_level);
        slot.maxLevel = Math.max(slot.maxLevel, d.max_level);
        slot.chance += d.chance ?? 0;
        slots.set(slotKey, slot);
      }
      const entries = [...slots.values()]
        .map((s) => ({ ...s, chance: Math.min(s.chance, 100) }))
        .sort((a, b) => b.chance - a.chance || a.method.localeCompare(b.method));
      version.areas.set(area, [...(version.areas.get(area) ?? []), ...entries]);
    }
  }

  return [...versions.values()]
    .map((v) => ({
      name: v.name,
      id: v.id,
      areas: [...v.areas].map(([area, entries]) => ({ area, entries })).sort(
        (a, b) => b.entries[0].chance - a.entries[0].chance || a.area.localeCompare(b.area)
      ),
    }))
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
}
