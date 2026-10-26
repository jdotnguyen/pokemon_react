import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRegion, useRegions } from '../../../../api/pokeapi';
import { formatName } from '../../../../lib/format';
import { generationLabel, regionColor, regionStarters, versionGroupLabel } from '../../../../lib/regions';
import { PokeballWatermark } from '../../../../components/Icons';
import HubBack from '../../../../components/HubBack';
import PageWatermark from '../../../../components/PageWatermark';
import ScreenTitle from '../../../../components/ScreenTitle';
import { artworkUrl } from '../../../../lib/sprites';
import { StatusMessage } from '../../../../components/ui';

function RegionCard({ name, index }) {
  const { data } = useRegion(name);
  const starters = regionStarters(name);
  const games = data?.version_groups.map((g) => versionGroupLabel(g.name)).join(' · ');

  return (
    <Pressable
      onPress={() => router.push(`/regions/${name}`)}
      style={({ pressed }) => [styles.card, { backgroundColor: regionColor(name, index) }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={formatName(name)}
    >
      <PokeballWatermark size={150} style={styles.cardBall} />
      <View style={styles.cardText}>
        <Text style={styles.cardName}>{formatName(name)}</Text>
        {data?.main_generation ? <Text style={styles.cardGen}>{generationLabel(data.main_generation.name)}</Text> : null}
        {games ? (
          <Text style={styles.cardGames} numberOfLines={2}>
            {games}
          </Text>
        ) : null}
      </View>
      <View style={styles.starters}>
        {starters.map((id, i) => (
          <Image
            key={id}
            source={{ uri: artworkUrl(id) }}
            style={[styles.starter, i > 0 && styles.starterOverlap]}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        ))}
      </View>
    </Pressable>
  );
}

export default function RegionsScreen() {
  const insets = useSafeAreaInsets();
  const { data, isPending, error, refetch } = useRegions();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <PageWatermark />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}>
        <HubBack fallback="/explore" />
        <ScreenTitle>Regions</ScreenTitle>
        {isPending || error ? (
          <StatusMessage loading={isPending} error={error} onRetry={() => refetch()} style={styles.status} />
        ) : (
          data.map((r, i) => <RegionCard key={r.name} name={r.name} index={i} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
  },
  card: {
    height: 128,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  cardBall: {
    position: 'absolute',
    right: -30,
    top: -20,
  },
  cardText: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  cardName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  cardGen: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  cardGames: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16,
  },
  starters: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    marginLeft: 8,
  },
  starter: {
    width: 52,
    height: 52,
  },
  starterOverlap: {
    marginLeft: -14,
  },
  status: {
    marginTop: 60,
    alignItems: 'center',
  },
});
