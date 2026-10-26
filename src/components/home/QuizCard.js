import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useBestStreak } from '../../lib/quizStats';
import { PokeballWatermark } from '../Icons';
import { useDaily } from './useDaily';
import { artworkUrl } from '../../lib/sprites';

/** Quiz teaser: a silhouette and your best streak. */
export default function QuizCard() {
  const { quizPick } = useDaily();
  const best = useBestStreak();
  return (
    <Pressable
      onPress={() => router.push('/quiz')}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Play Who's that Pokémon"
    >
      <PokeballWatermark size={110} style={styles.ball} />
      <View style={styles.text}>
        <Text style={styles.title}>Who's that Pokémon?</Text>
        <Text style={styles.sub}>{best > 0 ? `Best streak ${best}` : 'Name the silhouette'}</Text>
      </View>
      {quizPick ? (
        <Image
          source={{ uri: artworkUrl(quizPick.id) }}
          style={styles.art}
          tintColor="#0E3B33"
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: '#48D0B0', borderRadius: 22, padding: 16, minHeight: 150, overflow: 'hidden', justifyContent: 'flex-start' },
  pressed: { opacity: 0.85 },
  ball: { position: 'absolute', left: -20, top: -20 },
  text: { zIndex: 1 },
  title: { color: '#fff', fontSize: 17, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  art: { position: 'absolute', right: 0, bottom: 0, width: 96, height: 96 },
});
