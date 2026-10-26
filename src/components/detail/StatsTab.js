import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTypes } from '../../api/pokeapi';
import { formatMultiplier, formatName, STAT_LABELS } from '../../lib/format';
import { ALL_TYPES, typeColor } from '../../lib/types';
import { EmptyState, SectionTitle } from '../ui';
import { colors } from '../../theme';
import { typeDefenses } from '../../lib/typeInfo';

const STAT_MAX = 160; // bars clamp here; only a handful of Pokémon exceed it
const TOTAL_MAX = 720;
const LOW = '#F27C7C';
const HIGH = '#4CC38A';

function StatBar({ label, value, max }) {
  const pct = Math.min(value / max, 1) * 100;
  const low = value / max < 50 / STAT_MAX;
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: low ? LOW : HIGH }]} />
      </View>
    </View>
  );
}

function DefenseGroup({ title, entries }) {
  if (entries.length === 0) return null;
  return (
    <View style={styles.defenseGroup}>
      <Text style={styles.defenseTitle}>{title}</Text>
      <View style={styles.chips}>
        {entries.map(([type, m]) => (
          <View key={type} style={[styles.chip, { backgroundColor: typeColor(type) }]}>
            <Text style={styles.chipText}>
              {formatName(type)} {formatMultiplier(m)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function StatsTab({ pokemon, name }) {
  const typeNames = pokemon.types.map((t) => t.type.name);
  const typeQueries = useTypes(typeNames);
  const typesLoaded = typeQueries.every((q) => q.data);
  const total = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

  const multipliers = typesLoaded ? typeDefenses(typeQueries.map((q) => q.data), ALL_TYPES) : {};
  const entries = Object.entries(multipliers);
  const weak = entries.filter(([, m]) => m > 1).sort((a, b) => b[1] - a[1]);
  const resist = entries.filter(([, m]) => m > 0 && m < 1).sort((a, b) => a[1] - b[1]);
  const immune = entries.filter(([, m]) => m === 0);

  return (
    <View>
      {pokemon.stats.map((s) => (
        <StatBar
          key={s.stat.name}
          label={STAT_LABELS[s.stat.name] ?? formatName(s.stat.name)}
          value={s.base_stat}
          max={STAT_MAX}
        />
      ))}
      <StatBar label="Total" value={total} max={TOTAL_MAX} />
      <Pressable
        onPress={() => router.push({ pathname: '/calc', params: { a: String(pokemon.id) } })}
        hitSlop={8}
        accessibilityRole="link"
      >
        <Text style={styles.calcLink}>Open in stat calculator</Text>
      </Pressable>

      <SectionTitle>Type defenses</SectionTitle>
      <Text style={styles.caption}>The effectiveness of each type on {name}.</Text>
      {typesLoaded ? (
        <>
          <DefenseGroup title="Weak to" entries={weak} />
          <DefenseGroup title="Resistant to" entries={resist} />
          <DefenseGroup title="Immune to" entries={immune} />
        </>
      ) : typeQueries.some((q) => q.error) ? (
        <EmptyState>Couldn't load type data.</EmptyState>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  statLabel: {
    width: 80,
    fontSize: 14,
    color: colors.muted,
  },
  statValue: {
    width: 40,
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  calcLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 8,
  },
  caption: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 4,
  },
  defenseGroup: {
    marginTop: 14,
  },
  defenseTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.body,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
