import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useMove, useMoveIndex } from '../../api/pokeapi';
import { formatName } from '../../lib/format';
import { typeColor } from '../../lib/types';
import { Chip, EmptyState } from '../ui';
import { colors } from '../../theme';
import { availableMethods, moveEffect, movesByMethod } from '../../lib/moves';

const CLASS_LABEL = { physical: 'Physical', special: 'Special', status: 'Status' };

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MoveDetail({ name }) {
  const { data, isPending, error } = useMove(name);
  if (isPending) return <ActivityIndicator style={styles.detailLoading} color={colors.accent} />;
  if (error || !data) return <Text style={styles.effect}>Couldn't load this move.</Text>;
  const effect = moveEffect(data);
  return (
    <View style={styles.detail}>
      <View style={styles.statsRow}>
        <Stat label="Power" value={data.power} />
        <Stat label="Accuracy" value={data.accuracy != null ? `${data.accuracy}%` : null} />
        <Stat label="PP" value={data.pp} />
        <Stat label="Priority" value={data.priority > 0 ? `+${data.priority}` : data.priority} />
      </View>
      {effect ? <Text style={styles.effect}>{effect}</Text> : null}
      <Pressable onPress={() => router.push(`/moves/${name}`)} hitSlop={8} accessibilityRole="link">
        <Text style={styles.more}>Full details and who learns it</Text>
      </Pressable>
    </View>
  );
}

export default function MovesTab({ pokemon, color }) {
  const methods = useMemo(() => availableMethods(pokemon.moves), [pokemon.moves]);
  const [methodKey, setMethodKey] = useState(null);
  const [open, setOpen] = useState(null);
  const moveIndex = useMoveIndex();

  const active = methods.find((m) => m.key === methodKey) ?? methods[0];
  const moves = useMemo(
    () => (active ? movesByMethod(pokemon.moves, active.key) : []),
    [pokemon.moves, active]
  );

  if (!active) return <EmptyState>No moves recorded.</EmptyState>;

  return (
    <View>
      {methods.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methods}>
          {methods.map((m) => (
            <Chip
              key={m.key}
              label={m.label}
              active={m.key === active.key}
              onPress={() => {
                setMethodKey(m.key);
                setOpen(null);
              }}
            />
          ))}
        </ScrollView>
      )}

      {moves.map((m) => {
        const info = moveIndex.get(m.name);
        const expanded = open === m.name;
        return (
          <View key={`${active.key}-${m.name}`} style={styles.block}>
            <Pressable
              onPress={() => setOpen(expanded ? null : m.name)}
              style={styles.row}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
            >
              {active.key === 'level-up' && (
                <View style={[styles.level, { backgroundColor: color }]}>
                  <Text style={styles.levelText}>{m.level === 0 ? 'Evo' : `Lv. ${m.level}`}</Text>
                </View>
              )}
              <View style={styles.nameWrap}>
                <Text style={styles.name}>{formatName(m.name)}</Text>
                {info?.damageClass ? <Text style={styles.cls}>{CLASS_LABEL[info.damageClass]}</Text> : null}
              </View>
              {info?.type ? (
                <View style={[styles.typeChip, { backgroundColor: typeColor(info.type) }]}>
                  <Text style={styles.typeText}>{formatName(info.type)}</Text>
                </View>
              ) : null}
            </Pressable>
            {expanded && <MoveDetail name={m.name} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  methods: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 6,
  },
  block: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  level: {
    width: 56,
    borderRadius: 999,
    paddingVertical: 4,
    alignItems: 'center',
    marginRight: 14,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  nameWrap: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    color: colors.ink,
  },
  cls: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  typeChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  typeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  detail: {
    paddingBottom: 12,
  },
  detailLoading: {
    paddingVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 10,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  statLabel: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  more: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 10,
  },
  effect: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.body,
    marginTop: 10,
  },
});
