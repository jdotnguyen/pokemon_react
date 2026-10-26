// Move lists by learn method, and move effect text.
import { idFromUrl } from './format';

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

/**
 * Level-up moves from the most recent version group the Pokémon
 * has level-up data for, sorted by level.
 */
export function levelUpMoves(moves = []) {
  return movesByMethod(moves, 'level-up');
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
