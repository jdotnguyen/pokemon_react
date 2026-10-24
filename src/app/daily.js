import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokemonIndex } from '../api/pokeapi';
import { seededRng } from '../lib/daily';
import { CHALLENGE_LENGTH, recordChallenge, useDailyChallenge } from '../lib/dailyChallenge';
import { seededQuestions } from '../lib/quiz';
import { BackArrow } from '../components/Icons';
import QuestionCard from '../components/quiz/QuestionCard';
import { ACCENT } from '../components/detail/shared';

function Results({ score, total, streak, best, fresh }) {
  const message =
    score === total ? 'Perfect round!' : score >= Math.ceil(total / 2) ? 'Nice work.' : 'Better luck tomorrow.';
  return (
    <View style={styles.results}>
      <Text style={styles.resultKicker}>{fresh ? 'Challenge complete' : "Today's challenge is done"}</Text>
      <Text style={styles.resultScore}>
        {score}/{total}
      </Text>
      <Text style={styles.resultMessage}>{message}</Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{best}</Text>
          <Text style={styles.statLabel}>Best streak</Text>
        </View>
      </View>
      <Text style={styles.comeBack}>New Pokémon tomorrow. Everyone gets the same five.</Text>
    </View>
  );
}

export default function DailyChallengeScreen() {
  const insets = useSafeAreaInsets();
  const { data: index } = usePokemonIndex();
  const challenge = useDailyChallenge();

  const questions = useMemo(
    () => (index ? seededQuestions(index, challenge.today, CHALLENGE_LENGTH, seededRng) : []),
    [index, challenge.today]
  );

  const [started, setStarted] = useState(false); // once you answer, keep playing even if the saved state catches up
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[step];
  const answered = picked != null;
  const isLast = step === questions.length - 1;
  const showSummary = finished || (challenge.doneToday && !started);

  const choose = (id) => {
    if (answered) return;
    setStarted(true);
    setPicked(id);
    const isRight = id === question.answer.id;
    const total = correct + (isRight ? 1 : 0);
    setCorrect(total);
    if (isLast) recordChallenge(total, questions.length, challenge.today);
  };

  const next = () => {
    if (isLast) return setFinished(true);
    setStep(step + 1);
    setPicked(null);
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }}>
        <View style={styles.topBar}>
          <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
            <BackArrow color="#1F2A37" />
          </Pressable>
          <Text style={styles.title}>Daily challenge</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.body}>
          {showSummary ? (
            <>
              <Results
                score={finished ? correct : challenge.lastScore}
                total={finished ? questions.length : challenge.lastTotal}
                streak={challenge.streak}
                best={challenge.best}
                fresh={finished}
              />
              <Pressable onPress={goBack} style={styles.cta} accessibilityRole="button">
                <Text style={styles.ctaText}>Back to Home</Text>
              </Pressable>
            </>
          ) : question ? (
            <>
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  Question {step + 1} of {questions.length}
                </Text>
                <Text style={styles.progressText}>{challenge.streak > 0 ? `${challenge.streak}-day streak` : 'Start a streak'}</Text>
              </View>
              <View style={styles.dots}>
                {questions.map((q, i) => (
                  <View key={q.answer.id} style={[styles.dot, i < step || (i === step && answered) ? styles.dotDone : null]} />
                ))}
              </View>
              <QuestionCard question={question} picked={picked} onChoose={choose} />
              {answered && (
                <Pressable onPress={next} style={styles.cta} accessibilityRole="button">
                  <Text style={styles.ctaText}>{isLast ? 'See results' : 'Next'}</Text>
                </Pressable>
              )}
            </>
          ) : (
            <Text style={styles.loading}>Getting today's Pokémon ready…</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#1F2A37' },
  body: { paddingHorizontal: 24 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressText: { fontSize: 13, fontWeight: '700', color: '#8A94A1' },
  dots: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dot: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E6E9F0' },
  dotDone: { backgroundColor: ACCENT },
  cta: { marginTop: 18, borderRadius: 14, backgroundColor: ACCENT, paddingVertical: 14, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loading: { textAlign: 'center', color: '#8A94A1', marginTop: 60, fontSize: 15 },
  results: { alignItems: 'center', backgroundColor: '#F6F7F9', borderRadius: 28, paddingVertical: 32, paddingHorizontal: 20, marginTop: 16 },
  resultKicker: { fontSize: 12, fontWeight: '800', color: '#6C79DB', textTransform: 'uppercase', letterSpacing: 0.6 },
  resultScore: { fontSize: 64, fontWeight: '800', color: '#1F2A37', marginTop: 8 },
  resultMessage: { fontSize: 17, fontWeight: '700', color: '#4B5563' },
  statsRow: { flexDirection: 'row', gap: 40, marginTop: 24 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', color: '#1F2A37' },
  statLabel: { fontSize: 12, color: '#8A94A1', marginTop: 2 },
  comeBack: { fontSize: 13, color: '#8A94A1', marginTop: 24, textAlign: 'center' },
});
