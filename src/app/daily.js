import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokemonIndex } from '../api/pokeapi';
import { seededRng } from '../lib/daily';
import { CHALLENGE_LENGTH, recordChallenge, useDailyChallenge } from '../lib/dailyChallenge';
import { seededQuestions } from '../lib/quiz';
import HubBack from '../components/HubBack';
import PageWatermark from '../components/PageWatermark';
import ScreenTitle from '../components/ScreenTitle';
import QuestionCard from '../components/quiz/QuestionCard';
import { colors } from '../theme';

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
      <PageWatermark />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 40 }}>
        <View style={styles.header}>
          <HubBack fallback="/" />
          <ScreenTitle>Daily challenge</ScreenTitle>
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
  header: { paddingHorizontal: 19 }, // HubBack/ScreenTitle add 5 each, lining up with the 24px body
  body: { paddingHorizontal: 24 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressText: { fontSize: 13, fontWeight: '700', color: colors.muted },
  dots: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dot: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E6E9F0' },
  dotDone: { backgroundColor: colors.accent },
  cta: { marginTop: 18, borderRadius: 14, backgroundColor: colors.accent, paddingVertical: 14, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loading: { textAlign: 'center', color: colors.muted, marginTop: 60, fontSize: 15 },
  results: { alignItems: 'center', backgroundColor: colors.card, borderRadius: 28, paddingVertical: 32, paddingHorizontal: 20, marginTop: 16 },
  resultKicker: { fontSize: 12, fontWeight: '800', color: colors.accent, textTransform: 'uppercase', letterSpacing: 0.6 },
  resultScore: { fontSize: 64, fontWeight: '800', color: colors.ink, marginTop: 8 },
  resultMessage: { fontSize: 17, fontWeight: '700', color: colors.body },
  statsRow: { flexDirection: 'row', gap: 40, marginTop: 24 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.ink },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  comeBack: { fontSize: 13, color: colors.muted, marginTop: 24, textAlign: 'center' },
});
