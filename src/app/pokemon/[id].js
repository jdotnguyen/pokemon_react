import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokemon, useSpecies } from '../../api/pokeapi';
import { artworkUrl, englishEntry, formatName, padId } from '../../lib/format';
import { primaryColor } from '../../lib/types';
import { toggleFavourite, useIsFavourite } from '../../lib/favourites';
import { BackArrow, Heart, PokeballWatermark } from '../../components/Icons';
import TypeBadge from '../../components/TypeBadge';
import AboutTab from '../../components/detail/AboutTab';
import StatsTab from '../../components/detail/StatsTab';
import EvolutionTab from '../../components/detail/EvolutionTab';
import MovesTab from '../../components/detail/MovesTab';
import { ACCENT } from '../../components/detail/shared';

const TABS = [
  { key: 'about', label: 'About', Component: AboutTab },
  { key: 'stats', label: 'Base Stats', Component: StatsTab },
  { key: 'evolution', label: 'Evolution', Component: EvolutionTab },
  { key: 'moves', label: 'Moves', Component: MovesTab },
];

const ART_SIZE = 210;
const ART_OVERLAP = 48;

export default function PokemonDetailScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = Number(rawId);
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('about');
  const isFavourite = useIsFavourite(id);

  const pokemon = usePokemon(id);
  const species = useSpecies(id);

  const types = pokemon.data?.types.map((t) => t.type.name) ?? [];
  const color = primaryColor(types);
  const name =
    englishEntry(species.data?.names, 'name') ?? (pokemon.data ? formatName(pokemon.data.name) : '');

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const ActiveTab = TABS.find((t) => t.key === tab).Component;

  return (
    <View style={[styles.screen, { backgroundColor: color }]}>
      <StatusBar style="light" />
      <PokeballWatermark size={230} opacity={0.16} style={[styles.headerBall, { top: insets.top + 130 }]} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topBar}>
          <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
            <BackArrow />
          </Pressable>
          <Pressable
            onPress={() => toggleFavourite(id)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Heart filled={isFavourite} />
          </Pressable>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.number}>{padId(id)}</Text>
        </View>
        <View style={styles.typesRow}>
          {types.map((t) => (
            <TypeBadge key={t} type={t} size="large" />
          ))}
        </View>
      </View>

      <Image
        source={{ uri: artworkUrl(id) }}
        style={styles.art}
        contentFit="contain"
        transition={200}
        cachePolicy="memory-disk"
      />

      <View style={styles.sheet}>
        <View style={styles.tabs}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tab} accessibilityRole="tab">
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
                <View style={[styles.tabIndicator, active && { backgroundColor: ACCENT }]} />
              </Pressable>
            );
          })}
        </View>

        {pokemon.isPending ? (
          <ActivityIndicator style={styles.loading} color={ACCENT} />
        ) : pokemon.error ? (
          <Pressable onPress={() => pokemon.refetch()} style={styles.loading}>
            <Text style={styles.errorText}>Couldn't load this Pokémon. Tap to retry.</Text>
          </Pressable>
        ) : (
          <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: insets.bottom + 32 }]}>
            <ActiveTab pokemon={pokemon.data} species={species.data} name={name} color={color} />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerBall: {
    position: 'absolute',
    right: -40,
  },
  header: {
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    marginRight: 12,
  },
  number: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  typesRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  art: {
    width: ART_SIZE,
    height: ART_SIZE,
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: -ART_OVERLAP,
    zIndex: 2,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: ART_OVERLAP,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E3E7EC',
  },
  tab: {
    paddingTop: 12,
  },
  tabText: {
    fontSize: 14,
    color: '#A0A8B3',
    fontWeight: '500',
    paddingBottom: 12,
  },
  tabTextActive: {
    color: '#1F2A37',
    fontWeight: '700',
  },
  tabIndicator: {
    height: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  tabContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  loading: {
    marginTop: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#5B6573',
    fontSize: 15,
  },
});
