import { useMemo } from 'react';
import { usePokemonIndex } from '../../api/pokeapi';
import { dailyIndex, dateKey } from '../../lib/daily';

/** Today's Pokémon of the day and today's quiz teaser, stable all day. */
export function useDaily() {
  const { data: index } = usePokemonIndex();
  const today = dateKey();
  return useMemo(() => {
    if (!index?.length) return { index, today, pick: null, quizPick: null };
    const pick = index[dailyIndex(today, index.length)];
    let quizIdx = dailyIndex(`${today}-quiz`, index.length);
    if (index[quizIdx].id === pick.id) quizIdx = (quizIdx + 1) % index.length;
    return { index, today, pick, quizPick: index[quizIdx] };
  }, [index, today]);
}
