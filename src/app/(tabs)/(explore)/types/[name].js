import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTypes } from '../../../../api/pokeapi';
import { formatName } from '../../../../lib/format';
import { generationLabel } from '../../../../lib/regions';
import { dexPokemonOfType, typeMatchups } from '../../../../lib/typeInfo';
import { typeColor } from '../../../../lib/types';
import { BackArrow, PokeballWatermark } from '../../../../components/Icons';
import PokemonGrid from '../../../../components/PokemonGrid';
import SheetTabs from '../../../../components/SheetTabs';
import { ACCENT, EmptyState, SectionTitle } from '../../../../components/detail/shared';

const SECTIONS = [
  { key: 'matchups', label: 'Matchups' },
  { key: 'pokemon', label: 'Pokémon' },
];

function MatchupGroup({ title, multiplier, types }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>
        {title} <Text style={styles.multiplier}>{multiplier}</Text>
      </Text>
      {types.length === 0 ? (
        <Text style={styles.none}>None</Text>
      ) : (
        <View style={styles.chips}>
          {types.map((t) => (
            <Pressable
              key={t}
              // Replace rather than push, so hopping between types doesn't pile up a long back stack.
              onPress={() => router.replace(`/types/${t}`)}
              style={({ pressed }) => [styles.chip, { backgroundColor: typeColor(t) }, pressed && styles.chipPressed]}
              accessibilityRole="button"
              accessibilityLabel={`${formatName(t)} type`}
            >
              <Text style={styles.chipText}>{formatName(t)}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function Matchups({ matchups, insets }) {
  return (
    <ScrollView contentContainerStyle={[styles.matchups, { paddingBottom: insets.bottom + 90 }]}>
      <SectionTitle>Attacking</SectionTitle>
      {matchups.attacking.map((g) => (
        <MatchupGroup key={g.title} {...g} />
      ))}
      <SectionTitle>Defending</SectionTitle>
      {matchups.defending.map((g) => (
        <MatchupGroup key={g.title} {...g} />
      ))}
    </ScrollView>
  );
}

export default function TypeScreen() {
  const { name } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState('matchups');
  const [query] = useTypes([name]);
  const color = typeColor(name);

  const matchups = useMemo(() => typeMatchups(query.data), [query.data]);
  const pokemon = useMemo(() => dexPokemonOfType(query.data), [query.data]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/types'));

  return (
    <View style={[styles.screen, { backgroundColor: color }]}>
      <StatusBar style="light" />
      <PokeballWatermark size={200} opacity={0.16} style={[styles.headerBall, { top: insets.top - 10 }]} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={goBack} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
          <BackArrow />
        </Pressable>
        <Text style={styles.title}>{formatName(name)}</Text>
        {query.data ? (
          <Text style={styles.subtitle}>
            {[
              query.data.generation && `Introduced in ${generationLabel(query.data.generation.name)}`,
              `${pokemon.length} Pokémon`,
              `${query.data.moves.length} moves`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        ) : null}
      </View>

      <View style={styles.sheet}>
        <SheetTabs tabs={SECTIONS} value={section} onChange={setSection} />
        <View style={styles.body}>
          {query.isPending ? (
            <ActivityIndicator style={styles.loading} color={ACCENT} />
          ) : query.error ? (
            <Pressable onPress={() => query.refetch()} style={styles.loading}>
              <Text style={styles.errorText}>Couldn't load this type. Tap to retry.</Text>
            </Pressable>
          ) : section === 'matchups' ? (
            matchups ? <Matchups matchups={matchups} insets={insets} /> : <EmptyState>No matchup data.</EmptyState>
          ) : (
            <PokemonGrid data={pokemon} header={<View style={styles.gridSpacer} />} emptyText="No Pokémon of this type." />
          )}
        </View>
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
    paddingBottom: 24,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    overflow: 'hidden',
  },
  body: {
    flex: 1,
  },
  matchups: {
    paddingHorizontal: 24,
  },
  group: {
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  multiplier: {
    color: '#A0A8B3',
  },
  none: {
    fontSize: 13,
    color: '#A0A8B3',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  gridSpacer: {
    height: 14,
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
