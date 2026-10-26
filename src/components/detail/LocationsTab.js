import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { locationNameOfArea, useEncounters } from '../../api/pokeapi';
import { conditionLabel, encounterAreaLabel, groupEncountersByVersion, methodLabel } from '../../lib/encounters';
import { levelRange, versionLabel } from '../../lib/regions';
import { ChevronRight } from '../Icons';
import { Chip, EmptyState, StatusMessage } from '../ui';
import { colors } from '../../theme';

function AreaCard({ area, entries }) {
  const [opening, setOpening] = useState(false);

  const open = async () => {
    if (opening) return;
    setOpening(true);
    try {
      const location = await locationNameOfArea(area);
      router.push(`/regions/location/${location}`);
    } catch {
      // Leave the card as is; the data above is still useful without the link.
    } finally {
      setOpening(false);
    }
  };

  return (
    <Pressable
      onPress={open}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${encounterAreaLabel(area)}`}
    >
      <View style={styles.cardHead}>
        <Text style={styles.areaName}>{encounterAreaLabel(area)}</Text>
        {opening ? <ActivityIndicator size="small" color={colors.accent} /> : <ChevronRight />}
      </View>
      {entries.map((e, i) => (
        <View key={`${e.method}-${i}`} style={styles.entry}>
          <Text style={styles.method}>
            {methodLabel(e.method)}
            {e.conditions.length > 0 ? ` · ${e.conditions.map(conditionLabel).join(', ')}` : ''}
          </Text>
          <Text style={styles.detail}>
            {levelRange(e.minLevel, e.maxLevel)}
            {e.chance ? `  ·  ${e.chance}%` : ''}
          </Text>
        </View>
      ))}
    </Pressable>
  );
}

export default function LocationsTab({ pokemon, name }) {
  const { data, isPending, error, refetch } = useEncounters(pokemon.id);
  const versions = useMemo(() => groupEncountersByVersion(data), [data]);
  const [picked, setPicked] = useState(null);

  if (isPending || error) {
    return <StatusMessage loading={isPending} error={error} onRetry={() => refetch()} message="Couldn't load locations." />;
  }
  if (versions.length === 0) {
    return (
      <EmptyState>
        No wild encounters recorded for {name || 'this Pokémon'}. It may come from evolution, breeding, gifts, trades or events.
      </EmptyState>
    );
  }

  // Default to the newest game that has data.
  const active = versions.find((v) => v.name === picked) ?? versions[versions.length - 1];

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.versions}>
        {versions.map((v) => (
          <Chip key={v.name} label={versionLabel(v.name)} active={v.name === active.name} onPress={() => setPicked(v.name)} />
        ))}
      </ScrollView>

      <Text style={styles.summary}>
        {active.areas.length} {active.areas.length === 1 ? 'area' : 'areas'} in {versionLabel(active.name)}
      </Text>
      {active.areas.map((a) => (
        <AreaCard key={a.area} area={a.area} entries={a.entries} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  versions: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 10,
  },
  summary: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  areaName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginRight: 8,
  },
  entry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  method: {
    flex: 1,
    fontSize: 13,
    color: colors.body,
    marginRight: 8,
  },
  detail: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
  },
});
