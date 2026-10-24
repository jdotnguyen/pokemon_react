import { dateKey, previousDateKey } from './daily';
import { createStore } from './storage';

export const CHALLENGE_LENGTH = 5;

const store = createStore('daily-challenge', {
  lastDate: null,
  lastScore: 0,
  lastTotal: CHALLENGE_LENGTH,
  streak: 0,
  best: 0,
  played: 0,
});

/** Save today's result and move the day-streak on (plays on consecutive days build it; a gap resets it). */
export function recordChallenge(score, total = CHALLENGE_LENGTH, today = dateKey()) {
  const s = store.get();
  if (s.lastDate === today) return; // already counted today
  const streak = s.lastDate === previousDateKey(today) ? s.streak + 1 : 1;
  store.set({
    lastDate: today,
    lastScore: score,
    lastTotal: total,
    streak,
    best: Math.max(s.best, streak),
    played: s.played + 1,
  });
}

/** The streak as it stands today: still alive if you played today or yesterday, otherwise 0. */
export function liveStreak(state, today = dateKey()) {
  if (state.lastDate === today || state.lastDate === previousDateKey(today)) return state.streak;
  return 0;
}

export function useDailyChallenge() {
  const state = store.use();
  const today = dateKey();
  return {
    ...state,
    today,
    doneToday: state.lastDate === today,
    streak: liveStreak(state, today),
  };
}
