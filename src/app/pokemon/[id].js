import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokemon, useSpecies } from '../../api/pokeapi';
import { englishEntry, formatName, padId, pickArtwork, speciesBadges, speciesVarieties } from '../../lib/format';
import { primaryColor } from '../../lib/types';
import { toggleFavourite, useIsFavourite } from '../../lib/favourites';
import { recordRecent } from '../../lib/recent';
import { addToTeam, MAX_TEAM, removeFromTeam, useActiveTeamName, useIsInTeam, useTeamIsFull } from '../../lib/team';
import { BackArrow, Compare, Heart, PokeballWatermark, Sparkle, TeamIcon } from '../../components/Icons';
import TypeBadge from '../../components/TypeBadge';
import SheetTabs from '../../components/SheetTabs';
import AboutTab from '../../components/detail/AboutTab';
import StatsTab from '../../components/detail/StatsTab';
import EvolutionTab from '../../components/detail/EvolutionTab';
import MovesTab from '../../components/detail/MovesTab';
import LocationsTab from '../../components/detail/LocationsTab';
import CryButton from '../../components/detail/CryButton';
import FormsRow from '../../components/detail/FormsRow';
import { ACCENT } from '../../components/detail/shared';

const TABS = [
  { key: 'about', label: 'About', Component: AboutTab },
  { key: 'stats', label: 'Base Stats', Component: StatsTab },
  { key: 'evolution', label: 'Evolution', Component: EvolutionTab },
  { key: 'moves', label: 'Moves', Component: MovesTab },
  { key: 'locations', label: 'Locations', Component: LocationsTab },
];

const ART_SIZE = 210;
const ART_OVERLAP = 48;

export default function PokemonDetailScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = Number(rawId);
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('about');
  const isFavourite = useIsFavourite(id);
  useEffect(() => {
    if (Number.isFinite(id)) recordRecent(id);
  }, [id]);

  // Selected form + shiny toggle, keyed to the species so navigating to another Pokémon resets them.
  const [view, setView] = useState({ forId: id, variantId: id, shiny: false });
  const current = view.forId === id ? view : { forId: id, variantId: id, shiny: false };

  const species = useSpecies(id);
  const inTeam = useIsInTeam(current.variantId);
  const teamFull = useTeamIsFull();
  const teamName = useActiveTeamName();
  const pokemon = usePokemon(current.variantId);
  const varieties = speciesVarieties(species.data);
  const badges = speciesBadges(species.data);
  const shinyArt = pickArtwork(pokemon.data, current.variantId, true);
  const showShiny = current.shiny && shinyArt != null;
  const artUri = showShiny ? shinyArt : pickArtwork(pokemon.data, current.variantId);

  const types = pokemon.data?.types.map((t) => t.type.name) ?? [];
  const color = primaryColor(types);
  const name =
    englishEntry(species.data?.names, 'name') ?? (pokemon.data ? formatName(pokemon.data.name) : '');

  const onTeamPress = () => {
    if (inTeam) return removeFromTeam(current.variantId);
    if (teamFull) return Alert.alert('Team is full', `${teamName} already has ${MAX_TEAM} Pokémon. Remove one from Tools → Team matchups first.`);
    addToTeam(current.variantId);
  };

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
          <View style={styles.topActions}>
            <Pressable
              onPress={onTeamPress}
              hitSlop={12}
              style={styles.topAction}
              accessibilityRole="button"
              accessibilityLabel={inTeam ? `Remove from ${teamName}` : `Add to ${teamName}`}
            >
              <TeamIcon filled={inTeam} />
            </Pressable>
            <Pressable
              onPress={() => router.push({ pathname: '/compare', params: { a: String(current.variantId) } })}
              hitSlop={12}
              style={styles.topAction}
              accessibilityRole="button"
              accessibilityLabel="Compare with another Pokémon"
            >
              <Compare />
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
          <View style={styles.spacer} />
          {shinyArt != null && (
            <Pressable
              onPress={() => setView({ ...current, shiny: !current.shiny })}
              hitSlop={8}
              style={[styles.roundButton, showShiny && styles.roundButtonActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: showShiny }}
              accessibilityLabel={showShiny ? 'Show normal colours' : 'Show shiny colours'}
            >
              <Sparkle filled={showShiny} />
            </Pressable>
          )}
          {pokemon.data && <CryButton key={current.variantId} pokemon={pokemon.data} />}
        </View>
        {badges.length > 0 && (
          <View style={styles.badgesRow}>
            {badges.map((b) => (
              <View key={b} style={styles.badge}>
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <Image
        source={{ uri: artUri }}
        style={styles.art}
        contentFit="contain"
        transition={200}
        cachePolicy="memory-disk"
      />

      <View style={styles.sheet}>
        <SheetTabs tabs={TABS} value={tab} onChange={setTab} spread />
        <FormsRow
          varieties={varieties}
          selectedId={current.variantId}
          onSelect={(variantId) => setView({ forId: id, variantId, shiny: current.shiny })}
        />

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
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topAction: {
    marginRight: 18,
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
    alignItems: 'center',
    marginTop: 10,
  },
  spacer: {
    flex: 1,
  },
  roundButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.28)',
    marginRight: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
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
