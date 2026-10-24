/** Local calendar day as YYYY-MM-DD. */
export function dateKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// djb2 string hash, kept to 32 bits.
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h;
}

/** A stable index in [0, length) for the given day: the same all day, different day to day. */
export function dailyIndex(key, length) {
  return length > 0 ? hash(`pokedex-${key}`) % length : 0;
}

export function randomItem(list, rng = Math.random) {
  return list.length > 0 ? list[Math.floor(rng() * list.length)] : null;
}

/** The previous calendar day's key, e.g. '2026-03-01' -> '2026-02-28'. */
export function previousDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d - 1));
}

/** Deterministic rng (mulberry32) from a string seed: same seed, same sequence, on every device. */
export function seededRng(seed) {
  let a = hash(`seed-${seed}`);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
