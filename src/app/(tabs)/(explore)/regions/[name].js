import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { VirtualList } from '../../../../components/VirtualList';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokedex, useRegion } from '../../../../api/pokeapi';
import { formatName, idFromUrl } from '../../../../lib/format';
import { generationLabel, locationLabel, regionColor, versionGroupLabel } from '../../../../lib/regions';
import { ChevronRight } from '../../../../components/Icons';
import PokemonGrid from '../../../../components/PokemonGrid';
import SheetTabs from '../../../../components/SheetTabs';
import { EmptyState, StatusMessage } from '../../../../components/ui';
import { colors } from '../../../../theme';
import ColorHeader from '../../../../components/ColorHeader';

const SECTIONS = [
  { key: 'pokedex', label: 'Pokédex' },
  { key: 'locations', label: 'Locations' },
];

function DexChips({ dexes, active, onChange, color }) {
  if (dexes.length < 2) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {dexes.map((d) => {
        const selected = d.name === active;
        return (
          <Pressable
            key={d.name}
            onPress={() => onChange(d.name)}
            style={[styles.chip, selected ? { backgroundColor: color } : styles.chipIdle]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{formatName(d.name)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function RegionalDex({ dexes, color }) {
  const [chosen, setChosen] = useState(null);
  const active = chosen ?? dexes[0]?.name;
  const dex = usePokedex(active);

  const data = useMemo(
    () =>
      (dex.data?.pokemon_entries ?? []).map((e) => ({
        id: idFromUrl(e.pokemon_species.url),
        name: e.pokemon_species.name,
        number: e.entry_number,
      })),
    [dex.data]
  );

  if (dexes.length === 0) return <EmptyState>No regional Pokédex for this region.</EmptyState>;

  return (
    <PokemonGrid
      data={data}
      header={
        <View style={styles.gridHeader}>
          <DexChips dexes={dexes} active={active} onChange={setChosen} color={color} />
        </View>
      }
      loading={dex.isPending}
      error={dex.error}
      onRetry={() => dex.refetch()}
    />
  );
}

function Locations({ region }) {
  const insets = useSafeAreaInsets();
  const locations = useMemo(
    () =>
      [...region.locations]
        .map((l) => ({ name: l.name, label: locationLabel(l.name, region.name) }))
        .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true })),
    [region]
  );

  if (locations.length === 0) return <EmptyState>No locations recorded for this region.</EmptyState>;

  return (
    <VirtualList
      data={locations}
      keyExtractor={(l) => l.name}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 90 }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push(`/regions/location/${item.name}`)}
          style={({ pressed }) => [styles.locationRow, pressed && styles.rowPressed]}
          accessibilityRole="button"
        >
          <Text style={styles.locationName}>{item.label}</Text>
          <ChevronRight />
        </Pressable>
      )}
    />
  );
}

export default function RegionScreen() {
  const { name } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState('pokedex');
  const region = useRegion(name);
  const color = regionColor(name);

  const games = region.data?.version_groups.map((g) => versionGroupLabel(g.name)).join(' · ');

  return (
    <View style={[styles.screen, { backgroundColor: color }]}>
      <StatusBar style="light" />
      <ColorHeader title={formatName(name)} fallback="/regions">
        {region.data?.main_generation ? (
          <Text style={styles.subtitle}>{generationLabel(region.data.main_generation.name)}</Text>
        ) : null}
        {games ? (
          <Text style={styles.games} numberOfLines={2}>
            {games}
          </Text>
        ) : null}
      </ColorHeader>

      <View style={styles.sheet}>
        <SheetTabs tabs={SECTIONS} value={section} onChange={setSection} />

        <View style={styles.body}>
          {region.isPending || region.error ? (
            <StatusMessage loading={region.isPending} error={region.error} onRetry={() => region.refetch()} message="Couldn't load this region." />
          ) : section === 'pokedex' ? (
            <RegionalDex dexes={region.data.pokedexes} color={color} />
          ) : (
            <Locations region={region.data} />
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
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  games: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
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
  gridHeader: {
    paddingTop: 14,
    paddingBottom: 6,
  },
  chips: {
    gap: 8,
    paddingHorizontal: 5,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipIdle: {
    backgroundColor: colors.divider,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.subtle,
  },
  chipTextSelected: {
    color: '#fff',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowPressed: {
    opacity: 0.5,
  },
  locationName: {
    fontSize: 15,
    color: colors.ink,
  },
});
