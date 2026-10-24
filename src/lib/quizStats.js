import { createStore } from './storage';

// Best "Who's that Pokémon?" streak, shared by the quiz and the Home screen.
export const bestStore = createStore('quiz', { best: 0 });
export const useBestStreak = () => bestStore.use((s) => s.best);
