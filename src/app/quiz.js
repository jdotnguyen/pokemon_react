import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGeneration, useGenerations, usePokemonIndex } from '../api/pokeapi';
import { makeQuestion } from '../lib/quiz';
import { bestStore, useBestStreak } from '../lib/quizStats';
import { generationLabel } from '../lib/regions';
import { speciesIdsOfGeneration } from '../lib/typeInfo';
import { BackArrow } from '../components/Icons';
import QuestionCard from '../components/quiz/QuestionCard';
import { ACCENT, Chip } from '../components/detail/shared';

const RECENT = 12; // don't repeat an answer from the last few rounds

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const { data: index } = usePokemonIndex();
  const generations = useGenerations().data ?? [];
  const [generation, setGeneration] = useState(null);
  const genQuery = useGeneration(generation);
  const best = useBestStreak();

  const pool = useMemo(() => {
    if (!index) return [];
    if (!generation) return index;
    if (!genQuery.data) return [];
    const ids = new Set(speciesIdsOfGeneration(genQuery.data));
    return index.filter((p) => ids.has(p.id));
  }, [index, generation, genQuery.data]);

  const recent = useRef([]);
  const [question, setQuestion] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });

  const next = useCallback(() => {
    const q = makeQuestion(pool, Math.random, { avoid: new Set(recent.current) });
    if (q) recent.current = [...recent.current, q.answer.id].slice(-RECENT);
    setQuestion(q);
    setPicked(null);
  }, [pool]);

  // New pool (first load or a different generation) -> fresh run.
  useEffect(() => {
    recent.current = [];
    setScore({ correct: 0, total: 0, streak: 0 });
    next();
  }, [next]);

  const answered = picked != null;

  const choose = (id) => {
    if (answered) return;
    const correct = id === question.answer.id;
    setPicked(id);
    // Computed here, not inside a state updater: saving the best streak notifies other
    // components, and updaters run during render.
    const streak = correct ? score.streak + 1 : 0;
    setScore({ correct: score.correct + (correct ? 1 : 0), total: score.total + 1, streak });
    if (streak > best) bestStore.set({ best: streak });
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/tools'));

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }}>
        <View style={styles.topBar}>
          <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
            <BackArrow color="#1F2A37" />
          </Pressable>
          <Text style={styles.title}>Who's that Pokémon?</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gens} contentContainerStyle={styles.gensContent}>
          <Chip label="All" active={generation == null} onPress={() => setGeneration(null)} />
          {generations.map((g) => (
            <Chip
              key={g}
              label={generationLabel(g).replace('Generation ', 'Gen ')}
              active={generation === g}
              onPress={() => setGeneration(g)}
            />
          ))}
        </ScrollView>

        <View style={styles.scoreRow}>
          <Text style={styles.score}>
            {score.correct}/{score.total}
          </Text>
          <Text style={styles.meta}>
            Streak {score.streak} · Best {best}
          </Text>
        </View>

        {question ? (
          <View style={styles.body}>
            <QuestionCard question={question} picked={picked} onChoose={choose} />

            {answered && (
              <Pressable onPress={next} style={styles.next} accessibilityRole="button">
                <Text style={styles.nextText}>Next</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <Text style={styles.loading}>{generation && !genQuery.data ? 'Loading…' : 'Getting the Pokédex ready…'}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#1F2A37' },
  gens: { flexGrow: 0, flexShrink: 0 },
  gensContent: { paddingHorizontal: 24 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 14 },
  score: { fontSize: 28, fontWeight: '800', color: '#1F2A37' },
  meta: { fontSize: 14, color: '#8A94A1', fontWeight: '600' },
  body: { paddingHorizontal: 24 },
  next: { marginTop: 18, borderRadius: 14, backgroundColor: ACCENT, paddingVertical: 14, alignItems: 'center' },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loading: { textAlign: 'center', color: '#8A94A1', marginTop: 60, fontSize: 15 },
});
