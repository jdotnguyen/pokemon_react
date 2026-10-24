import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useDailyChallenge } from '../../lib/dailyChallenge';
import { PokeballWatermark } from '../Icons';

/** Home card for the daily challenge: shows today's result once played, otherwise the streak at stake. */
export default function DailyChallengeCard() {
  const c = useDailyChallenge();
  const title = c.doneToday ? `Done: ${c.lastScore}/${c.lastTotal} today` : 'Daily challenge';
  const sub = c.doneToday
    ? `${c.streak}-day streak. New questions tomorrow`
    : c.streak > 0
      ? `Five silhouettes. Keep your ${c.streak}-day streak alive`
      : 'Five silhouettes, the same for everyone';

  return (
    <Pressable
      onPress={() => router.push('/daily')}
      style={({ pressed }) => [styles.card, c.doneToday && styles.cardDone, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Daily challenge"
    >
      <PokeballWatermark size={120} style={styles.ball} />
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
      <View style={styles.streak}>
        <Text style={styles.streakNumber}>{c.streak}</Text>
        <Text style={styles.streakLabel}>{c.streak === 1 ? 'day' : 'days'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#F4A340', borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  cardDone: { backgroundColor: '#7BC47F' },
  pressed: { opacity: 0.85 },
  ball: { position: 'absolute', right: -20, bottom: -40 },
  text: { flex: 1, marginRight: 12, zIndex: 1 },
  title: { color: '#fff', fontSize: 17, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.92)', fontSize: 12, fontWeight: '600', marginTop: 3 },
  streak: { alignItems: 'center', minWidth: 52, zIndex: 1 },
  streakNumber: { color: '#fff', fontSize: 30, fontWeight: '800', lineHeight: 34 },
  streakLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
});
