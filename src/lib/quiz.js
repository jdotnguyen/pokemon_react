const shuffle = (list, rng) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * One "Who's that Pokémon?" round from a pool of { id, name }: the answer plus distractors, shuffled.
 * `avoid` is a set of ids to skip as the answer (recent rounds). Returns null for an empty pool.
 */
export function makeQuestion(pool, rng = Math.random, { choices = 4, avoid = new Set() } = {}) {
  if (!pool || pool.length === 0) return null;
  const candidates = pool.filter((p) => !avoid.has(p.id));
  const source = candidates.length > 0 ? candidates : pool;
  const answer = source[Math.floor(rng() * source.length)];
  const others = shuffle(
    pool.filter((p) => p.id !== answer.id),
    rng
  ).slice(0, Math.max(0, choices - 1));
  return { answer, options: shuffle([answer, ...others], rng) };
}

/**
 * Today's challenge: `count` questions that depend only on the pool and the seed, so everyone
 * with the same Pokédex gets the same round on the same day. No answer repeats within the round.
 */
export function seededQuestions(pool, seed, count, seededRng) {
  const rng = seededRng(seed);
  const used = new Set();
  const questions = [];
  for (let i = 0; i < count; i++) {
    const q = makeQuestion(pool, rng, { avoid: used });
    if (!q) break;
    used.add(q.answer.id);
    questions.push(q);
  }
  return questions;
}
