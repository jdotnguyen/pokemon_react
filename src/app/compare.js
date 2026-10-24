import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokemon, useTypes } from '../api/pokeapi';
import {
  compareStats,
  formatHeight,
  formatMultiplier,
  formatName,
  formatWeight,
  matchupMultipliers,
  padId,
  pickArtwork,
  typeDefenses,
} from '../lib/format';
import { ALL_TYPES, primaryColor, typeColor } from '../lib/types';
import { BackArrow } from '../components/Icons';
import PokemonPicker from '../components/PokemonPicker';
import TypeBadge from '../components/TypeBadge';
import { ACCENT, SectionTitle } from '../components/detail/shared';

const STAT_MAX = 160;
const TOTAL_MAX = 720;
const WIN = '#1E9E6A';

const parseId = (v) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

function Slot({ id, onPress }) {
  const { data } = usePokemon(id);
  if (id == null) {
    return (
      <Pressable onPress={onPress} style={[styles.slot, styles.slotEmpty]} accessibilityRole="button">
        <Text style={styles.plus}>+</Text>
        <Text style={styles.slotEmptyText}>Choose Pokémon</Text>
      </Pressable>
    );
  }
  const types = data?.types.map((t) => t.type.name) ?? [];
  return (
    <Pressable
      onPress={onPress}
      style={[styles.slot, { backgroundColor: primaryColor(types) }]}
      accessibilityRole="button"
      accessibilityLabel="Change Pokémon"
    >
      <Image source={{ uri: pickArtwork(data, id) }} style={styles.slotArt} contentFit="contain" cachePolicy="memory-disk" />
      <Text style={styles.slotName} numberOfLines={1}>
        {data ? formatName(data.name) : ' '}
      </Text>
      <Text style={styles.slotNumber}>{padId(id)}</Text>
      <View style={styles.slotTypes}>
        {types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </View>
    </Pressable>
  );
}

function StatRow({ row, max, colorA, colorB }) {
  const pct = (v) => `${Math.min(v / max, 1) * 100}%`;
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statLabel}>{row.label}</Text>
      <View style={styles.statLine}>
        <Text style={[styles.val, styles.valLeft, row.winner === 'a' && styles.valWin]}>{row.a}</Text>
        <View style={[styles.track, styles.trackLeft]}>
          <View style={[styles.fill, { width: pct(row.a), backgroundColor: colorA, opacity: row.winner === 'b' ? 0.45 : 1 }]} />
        </View>
        <View style={[styles.track, styles.trackRight]}>
          <View style={[styles.fill, { width: pct(row.b), backgroundColor: colorB, opacity: row.winner === 'a' ? 0.45 : 1 }]} />
        </View>
        <Text style={[styles.val, styles.valRight, row.winner === 'b' && styles.valWin]}>{row.b}</Text>
      </View>
    </View>
  );
}

function FactRow({ label, a, b }) {
  return (
    <View style={styles.factRow}>
      <Text style={[styles.factValue, { textAlign: 'left' }]}>{a}</Text>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={[styles.factValue, { textAlign: 'right' }]}>{b}</Text>
    </View>
  );
}

function MatchupLine({ attackerName, defenderName, entries }) {
  return (
    <View style={styles.matchup}>
      <Text style={styles.matchupText}>
        {attackerName}'s types vs {defenderName}
      </Text>
      <View style={styles.chips}>
        {entries.map(({ type, multiplier }) => (
          <View key={type} style={[styles.chip, { backgroundColor: typeColor(type) }]}>
            <Text style={styles.chipText}>
              {formatName(type)} {formatMultiplier(multiplier)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function CompareScreen() {
  const params = useLocalSearchParams();
  const a = parseId(params.a);
  const b = parseId(params.b);
  const insets = useSafeAreaInsets();
  const [picking, setPicking] = useState(null); // 'a' | 'b' | null

  const pa = usePokemon(a);
  const pb = usePokemon(b);
  const typesA = pa.data?.types.map((t) => t.type.name) ?? [];
  const typesB = pb.data?.types.map((t) => t.type.name) ?? [];
  const typeQueriesA = useTypes(typesA);
  const typeQueriesB = useTypes(typesB);

  const ready = pa.data && pb.data;
  const result = ready ? compareStats(pa.data.stats, pb.data.stats) : null;
  const nameA = pa.data ? formatName(pa.data.name) : '';
  const nameB = pb.data ? formatName(pb.data.name) : '';
  const colorA = primaryColor(typesA);
  const colorB = primaryColor(typesB);

  const typesReady =
    ready && typeQueriesA.length > 0 && typeQueriesB.length > 0 &&
    typeQueriesA.every((q) => q.data) && typeQueriesB.every((q) => q.data);
  const defA = typesReady ? typeDefenses(typeQueriesA.map((q) => q.data), ALL_TYPES) : {};
  const defB = typesReady ? typeDefenses(typeQueriesB.map((q) => q.data), ALL_TYPES) : {};

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const onPick = (id) => {
    router.setParams({ [picking]: String(id) });
    setPicking(null);
  };

  const verdict = result
    ? result.total.winner === null
      ? 'Dead even on total stats'
      : `${result.total.winner === 'a' ? nameA : nameB} has the higher total (${Math.max(result.total.a, result.total.b)} vs ${Math.min(result.total.a, result.total.b)})`
    : null;

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }}>
        <View style={styles.topBar}>
          <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
            <BackArrow color="#1F2A37" />
          </Pressable>
          <Text style={styles.title}>Compare</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.slots}>
          <Slot id={a} onPress={() => setPicking('a')} />
          <Text style={styles.vs}>VS</Text>
          <Slot id={b} onPress={() => setPicking('b')} />
        </View>

        {a != null && b != null && !ready && !pa.error && !pb.error ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={ACCENT} />
        ) : null}
        {(pa.error || pb.error) && <Text style={styles.hint}>Couldn't load one of the Pokémon.</Text>}
        {(a == null || b == null) && (
          <Text style={styles.hint}>Pick two Pokémon to compare their stats.</Text>
        )}

        {result && (
          <View style={styles.body}>
            <Text style={styles.verdict}>{verdict}</Text>
            <Text style={styles.tally}>
              {nameA} wins {result.tally.a} · {nameB} wins {result.tally.b} of {result.rows.length} stats
            </Text>

            <SectionTitle>Base stats</SectionTitle>
            {result.rows.map((r) => (
              <StatRow key={r.key} row={r} max={STAT_MAX} colorA={colorA} colorB={colorB} />
            ))}
            <StatRow row={result.total} max={TOTAL_MAX} colorA={colorA} colorB={colorB} />

            <SectionTitle>Size</SectionTitle>
            <FactRow label="Height" a={formatHeight(pa.data.height)} b={formatHeight(pb.data.height)} />
            <FactRow label="Weight" a={formatWeight(pa.data.weight)} b={formatWeight(pb.data.weight)} />

            {typesReady && (
              <>
                <SectionTitle>Type matchup</SectionTitle>
                <MatchupLine attackerName={nameA} defenderName={nameB} entries={matchupMultipliers(typesA, defB)} />
                <MatchupLine attackerName={nameB} defenderName={nameA} entries={matchupMultipliers(typesB, defA)} />
              </>
            )}
          </View>
        )}
      </ScrollView>

      <PokemonPicker visible={picking != null} onClose={() => setPicking(null)} onPick={onPick} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1F2A37' },
  slots: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  vs: { width: 36, textAlign: 'center', fontSize: 13, fontWeight: '800', color: '#9AA3AE' },
  slot: { flex: 1, borderRadius: 24, padding: 12, alignItems: 'center', minHeight: 210 },
  slotEmpty: {
    backgroundColor: '#F6F7F9',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D5DAE0',
    justifyContent: 'center',
  },
  plus: { fontSize: 36, color: '#9AA3AE', lineHeight: 40 },
  slotEmptyText: { fontSize: 14, color: '#8A94A1', fontWeight: '600', marginTop: 4 },
  slotArt: { width: 110, height: 110 },
  slotName: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 6 },
  slotNumber: { color: '#fff', fontSize: 13, fontWeight: '600', opacity: 0.85 },
  slotTypes: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginTop: 2 },
  hint: { textAlign: 'center', color: '#8A94A1', fontSize: 15, marginTop: 28, paddingHorizontal: 24 },
  body: { paddingHorizontal: 24, paddingTop: 20 },
  verdict: { fontSize: 16, fontWeight: '700', color: '#1F2A37', textAlign: 'center' },
  tally: { fontSize: 13, color: '#8A94A1', textAlign: 'center', marginTop: 4 },
  statBlock: { marginBottom: 10 },
  statLabel: { textAlign: 'center', fontSize: 12, color: '#8A94A1', marginBottom: 4 },
  statLine: { flexDirection: 'row', alignItems: 'center' },
  val: { width: 36, fontSize: 14, fontWeight: '600', color: '#1F2A37' },
  valLeft: { textAlign: 'left' },
  valRight: { textAlign: 'right' },
  valWin: { color: WIN, fontWeight: '800' },
  track: { flex: 1, height: 6, backgroundColor: '#EEF1F4', overflow: 'hidden' },
  trackLeft: { alignItems: 'flex-end', borderTopLeftRadius: 3, borderBottomLeftRadius: 3, marginRight: 1 },
  trackRight: { alignItems: 'flex-start', borderTopRightRadius: 3, borderBottomRightRadius: 3, marginLeft: 1 },
  fill: { height: '100%' },
  factRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  factValue: { flex: 1.3, fontSize: 13, color: '#1F2A37' },
  factLabel: { flex: 0.8, textAlign: 'center', fontSize: 12, color: '#8A94A1' },
  matchup: { marginBottom: 14 },
  matchupText: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
