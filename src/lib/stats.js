// Gen 3+ stat formulas.
import { STAT_LABELS, formatName } from './format';
export const STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
export const MAX_IV = 31;
export const MAX_EV = 252;
export const MAX_EV_TOTAL = 510;

export const clamp = (n, min, max) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));

/** Parse a text input as a whole number within [min, max] (empty / junk -> min). */
export function parseBounded(text, min, max) {
  return clamp(parseInt(String(text).replace(/[^0-9]/g, ''), 10), min, max);
}

/** 1.1 for the raised stat, 0.9 for the lowered one, otherwise 1. */
export function natureMultiplier(nature, key) {
  if (!nature) return 1;
  if (nature.increased_stat?.name === key && nature.decreased_stat?.name !== key) return 1.1;
  if (nature.decreased_stat?.name === key && nature.increased_stat?.name !== key) return 0.9;
  return 1;
}

export function calcStat(key, base, { level, iv, ev, natureMult = 1 }) {
  const core = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100);
  if (key === 'hp') return base === 1 ? 1 : core + level + 10; // Shedinja always has 1 HP
  return Math.floor((core + 5) * natureMult);
}

/** Final stats for a Pokémon: `stats` is pokemon.stats, `ivs`/`evs` are maps keyed by stat name. */
export function calcAll(stats, { level, ivs, evs, nature }) {
  return stats.map((s) => {
    const key = s.stat.name;
    const natureMult = natureMultiplier(nature, key);
    return {
      key,
      base: s.base_stat,
      iv: ivs[key] ?? 0,
      ev: evs[key] ?? 0,
      natureMult,
      value: calcStat(key, s.base_stat, { level, iv: ivs[key] ?? 0, ev: evs[key] ?? 0, natureMult }),
    };
  });
}

export const evTotal = (evs) => STAT_KEYS.reduce((sum, k) => sum + (evs[k] ?? 0), 0);

/** Set one EV, respecting the 252 per-stat and 510 total caps. */
export function setEv(evs, key, value) {
  const others = evTotal(evs) - (evs[key] ?? 0);
  const capped = clamp(value, 0, Math.min(MAX_EV, MAX_EV_TOTAL - others));
  return { ...evs, [key]: capped };
}

export const allIvs = (value) => Object.fromEntries(STAT_KEYS.map((k) => [k, value]));

export const EV_PRESETS = [
  { key: 'none', label: 'None', evs: {} },
  { key: 'physical', label: 'Physical', evs: { hp: 4, attack: 252, speed: 252 } },
  { key: 'special', label: 'Special', evs: { hp: 4, 'special-attack': 252, speed: 252 } },
  { key: 'tank', label: 'Bulky', evs: { hp: 252, defense: 252, 'special-defense': 4 } },
];

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
