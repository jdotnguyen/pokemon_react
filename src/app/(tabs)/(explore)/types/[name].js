import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTypes } from '../../../../api/pokeapi';
import { formatName } from '../../../../lib/format';
import { generationLabel } from '../../../../lib/regions';
import { dexPokemonOfType, typeMatchups } from '../../../../lib/typeInfo';
import { typeColor } from '../../../../lib/types';
import PokemonGrid from '../../../../components/PokemonGrid';
import SheetTabs from '../../../../components/SheetTabs';
import { EmptyState, SectionTitle, StatusMessage } from '../../../../components/ui';
import { colors } from '../../../../theme';
import ColorHeader from '../../../../components/ColorHeader';

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

  return (
    <View style={[styles.screen, { backgroundColor: color }]}>
      <StatusBar style="light" />
      <ColorHeader title={formatName(name)} fallback="/types">
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
      </ColorHeader>

      <View style={styles.sheet}>
        <SheetTabs tabs={SECTIONS} value={section} onChange={setSection} />
        <View style={styles.body}>
          {query.isPending || query.error ? (
            <StatusMessage loading={query.isPending} error={query.error} onRetry={() => query.refetch()} message="Couldn't load this type." />
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
    color: colors.body,
    marginBottom: 8,
  },
  multiplier: {
    color: colors.faint,
  },
  none: {
    fontSize: 13,
    color: colors.faint,
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
});
