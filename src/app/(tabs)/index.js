import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DailyPokemon from '../../components/DailyPokemon';
import { ChevronRight, PokeballWatermark } from '../../components/Icons';
import DailyChallengeCard from '../../components/home/DailyChallengeCard';
import FactCard from '../../components/home/FactCard';
import PokemonStrip from '../../components/home/PokemonStrip';
import QuickActions from '../../components/home/QuickActions';
import ProgressCard from '../../components/home/ProgressCard';
import QuizCard from '../../components/home/QuizCard';
import Section from '../../components/home/Section';
import TeamStrip from '../../components/home/TeamStrip';
import TypeOfDay from '../../components/home/TypeOfDay';
import { useDaily } from '../../components/home/useDaily';
import { useFavourites } from '../../lib/favourites';
import { useRecent } from '../../lib/recent';

function greeting(hour) {
  if (hour < 5) return 'Up late?';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function BrowseCard({ count }) {
  return (
    <Pressable
      onPress={() => router.push('/pokedex')}
      style={({ pressed }) => [styles.browse, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Browse the full Pokédex"
    >
      <PokeballWatermark size={110} style={styles.browseBall} />
      <View>
        <Text style={styles.browseTitle}>Pokédex</Text>
        <Text style={styles.browseSub}>{count ? `Browse all ${count}` : 'Browse all'}</Text>
      </View>
      <View style={styles.browseArrow}>
        <ChevronRight color="#fff" />
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { index } = useDaily();
  const favourites = useFavourites();
  const recent = useRecent();

  const now = new Date();
  const favouriteIds = [...favourites].reverse().slice(0, 12);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <Section index={0} style={styles.header}>
          <Text style={styles.date}>
            {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={styles.greeting}>{greeting(now.getHours())}</Text>
        </Section>

        <Section index={1} style={styles.gap}>
          <DailyPokemon />
        </Section>

        <Section index={2} style={[styles.row, styles.gap]}>
          <QuizCard />
          <BrowseCard count={index?.length} />
        </Section>

        <Section index={3} style={styles.gap}>
          <QuickActions />
        </Section>

        <Section index={4} style={styles.gap}>
          <DailyChallengeCard />
        </Section>

        <Section index={5} style={styles.gap}>
          <TypeOfDay />
        </Section>

        <Section index={6} style={styles.gap}>
          <FactCard />
        </Section>

        <Section index={7} style={styles.gap}>
          <TeamStrip />
        </Section>

        <Section index={8} style={styles.gap}>
          <ProgressCard />
        </Section>

        {recent.length > 0 && (
          <Section index={9} style={styles.gap}>
            <PokemonStrip title="Recently viewed" ids={recent} />
          </Section>
        )}

        {favouriteIds.length > 0 && (
          <Section index={10} style={styles.gap}>
            <PokemonStrip title="Favourites" ids={favouriteIds} actionLabel="See all" onAction={() => router.navigate('/favourites')} />
          </Section>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 20 },
  header: { marginTop: 24 },
  date: { fontSize: 13, fontWeight: '700', color: '#8A94A1', textTransform: 'uppercase', letterSpacing: 0.6 },
  greeting: { fontSize: 32, fontWeight: '800', color: '#1F2A37', marginTop: 2 },
  gap: { marginTop: 22 },
  row: { flexDirection: 'row', gap: 12 },
  pressed: { opacity: 0.85 },
  browse: {
    flex: 1,
    backgroundColor: '#6C79DB',
    borderRadius: 22,
    padding: 16,
    minHeight: 150,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  browseBall: { position: 'absolute', right: -24, top: -24 },
  browseTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  browseSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  browseArrow: { alignSelf: 'flex-end' },
});
