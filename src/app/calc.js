import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNatures, usePokemon } from '../api/pokeapi';
import { natureEffect, statShort } from '../lib/browse';
import { artworkUrl, formatName, padId, STAT_LABELS } from '../lib/format';
import {
  EV_PRESETS,
  MAX_EV,
  MAX_EV_TOTAL,
  MAX_IV,
  STAT_KEYS,
  allIvs,
  calcAll,
  evTotal,
  parseBounded,
  setEv,
} from '../lib/stats';
import { primaryColor } from '../lib/types';
import { BackArrow } from '../components/Icons';
import PokemonPicker from '../components/PokemonPicker';
import { ACCENT, Chip, SectionTitle } from '../components/detail/shared';

const UP = '#D64545';
const DOWN = '#3B82C4';
const STAT_MAX = 400; // result bars clamp here

const parseId = (v) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

function NaturePicker({ visible, natures, onPick, onClose }) {
  const insets = useSafeAreaInsets();
  const rows = [{ name: null }, ...natures];
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { paddingBottom: insets.bottom }]}>
        <View style={styles.modalTop}>
          <Text style={styles.modalTitle}>Nature</Text>
          <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>
        <FlatList
          data={rows}
          keyExtractor={(n) => n.name ?? 'neutral'}
          renderItem={({ item }) => {
            const { up, down } = natureEffect(item);
            return (
              <Pressable onPress={() => onPick(item.name)} style={styles.natureRow} accessibilityRole="button">
                <Text style={styles.natureName}>{item.name ? formatName(item.name) : 'No nature (neutral)'}</Text>
                {up && down ? (
                  <Text style={styles.natureEffect}>
                    <Text style={{ color: UP }}>+{statShort(up)}</Text>  <Text style={{ color: DOWN }}>−{statShort(down)}</Text>
                  </Text>
                ) : null}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

function NumberInput({ value, onChange, width = 46 }) {
  return (
    <TextInput
      value={String(value)}
      onChangeText={onChange}
      keyboardType="number-pad"
      selectTextOnFocus
      maxLength={3}
      style={[styles.numInput, { width }]}
    />
  );
}

export default function CalcScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const id = parseId(params.a);
  const natureParam = Array.isArray(params.nature) ? params.nature[0] : params.nature;

  const { data: pokemon } = usePokemon(id);
  const { natures: natureQueries } = useNatures();
  const natureList = natureQueries.map((q) => q.data).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));

  const [level, setLevel] = useState(50);
  const [ivs, setIvs] = useState(allIvs(MAX_IV));
  const [evs, setEvs] = useState({});
  const [natureName, setNatureName] = useState(natureParam ?? null);
  const [picking, setPicking] = useState(null); // 'pokemon' | 'nature'

  const nature = natureList.find((n) => n.name === natureName) ?? null;
  const { up, down } = natureEffect(nature);
  const results = useMemo(
    () => (pokemon ? calcAll(pokemon.stats, { level, ivs, evs, nature }) : []),
    [pokemon, level, ivs, evs, nature]
  );
  const types = pokemon?.types.map((t) => t.type.name) ?? [];
  const usedEvs = evTotal(evs);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/tools'));

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 60 }}
      >
        <View style={styles.topBar}>
          <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
            <BackArrow color="#1F2A37" />
          </Pressable>
          <Text style={styles.title}>Stat calculator</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.body}>
          <Pressable
            onPress={() => setPicking('pokemon')}
            style={[styles.pokemonCard, { backgroundColor: id ? primaryColor(types) : '#F6F7F9' }]}
            accessibilityRole="button"
            accessibilityLabel="Choose Pokémon"
          >
            {id ? (
              <>
                <Image source={{ uri: artworkUrl(id) }} style={styles.art} contentFit="contain" cachePolicy="memory-disk" />
                <View>
                  <Text style={styles.pokemonName}>{pokemon ? formatName(pokemon.name) : ' '}</Text>
                  <Text style={styles.pokemonNumber}>{padId(id)} · tap to change</Text>
                </View>
              </>
            ) : (
              <Text style={styles.choose}>Choose a Pokémon</Text>
            )}
          </Pressable>

          <SectionTitle>Level</SectionTitle>
          <View style={styles.levelRow}>
            <NumberInput value={level} onChange={(t) => setLevel(parseBounded(t, 1, 100))} />
            {[5, 50, 100].map((l) => (
              <Chip key={l} label={String(l)} active={level === l} onPress={() => setLevel(l)} />
            ))}
          </View>

          <SectionTitle>Nature</SectionTitle>
          <Pressable onPress={() => setPicking('nature')} style={styles.natureButton} accessibilityRole="button">
            <Text style={styles.natureButtonName}>{nature ? formatName(nature.name) : 'None (neutral)'}</Text>
            {up && down ? (
              <Text style={styles.natureEffect}>
                <Text style={{ color: UP }}>+{statShort(up)}</Text>  <Text style={{ color: DOWN }}>−{statShort(down)}</Text>
              </Text>
            ) : null}
          </Pressable>

          <SectionTitle>IVs</SectionTitle>
          <View style={styles.presets}>
            <Chip label="All 31" active={STAT_KEYS.every((k) => ivs[k] === 31)} onPress={() => setIvs(allIvs(31))} />
            <Chip label="All 0" active={STAT_KEYS.every((k) => ivs[k] === 0)} onPress={() => setIvs(allIvs(0))} />
          </View>

          <SectionTitle>EVs</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
            {EV_PRESETS.map((p) => (
              <Chip
                key={p.key}
                label={p.label}
                active={STAT_KEYS.every((k) => (evs[k] ?? 0) === (p.evs[k] ?? 0))}
                onPress={() => setEvs(p.evs)}
              />
            ))}
          </ScrollView>
          <Text style={[styles.evCount, usedEvs >= MAX_EV_TOTAL && styles.evFull]}>
            {usedEvs} / {MAX_EV_TOTAL} EVs used · max {MAX_EV} per stat
          </Text>

          {pokemon ? (
            <>
              <View style={styles.tableHead}>
                <Text style={[styles.th, styles.colName]}>Stat</Text>
                <Text style={[styles.th, styles.colBase]}>Base</Text>
                <Text style={[styles.th, styles.colInput]}>IV</Text>
                <Text style={[styles.th, styles.colInput]}>EV</Text>
                <Text style={[styles.th, styles.colResult]}>Total</Text>
              </View>
              {results.map((r) => (
                <View key={r.key} style={styles.rowWrap}>
                  <View style={styles.tableRow}>
                    <Text
                      style={[
                        styles.colName,
                        styles.statName,
                        r.natureMult > 1 && { color: UP },
                        r.natureMult < 1 && { color: DOWN },
                      ]}
                    >
                      {STAT_LABELS[r.key] ?? formatName(r.key)}
                      {r.natureMult > 1 ? ' ▲' : r.natureMult < 1 ? ' ▼' : ''}
                    </Text>
                    <Text style={[styles.colBase, styles.base]}>{r.base}</Text>
                    <View style={styles.colInput}>
                      <NumberInput
                        value={r.iv}
                        width={40}
                        onChange={(t) => setIvs({ ...ivs, [r.key]: parseBounded(t, 0, MAX_IV) })}
                      />
                    </View>
                    <View style={styles.colInput}>
                      <NumberInput
                        value={r.ev}
                        width={44}
                        onChange={(t) => setEvs(setEv(evs, r.key, parseBounded(t, 0, MAX_EV)))}
                      />
                    </View>
                    <Text style={[styles.colResult, styles.result]}>{r.value}</Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${Math.min(r.value / STAT_MAX, 1) * 100}%` }]} />
                  </View>
                </View>
              ))}
            </>
          ) : id == null ? (
            <Text style={styles.hint}>Pick a Pokémon to see its stats at level {level}.</Text>
          ) : null}
        </View>
      </ScrollView>

      <PokemonPicker
        visible={picking === 'pokemon'}
        onClose={() => setPicking(null)}
        onPick={(pid) => {
          router.setParams({ a: String(pid) });
          setPicking(null);
        }}
      />
      <NaturePicker
        visible={picking === 'nature'}
        natures={natureList}
        onClose={() => setPicking(null)}
        onPick={(name) => {
          setNatureName(name);
          setPicking(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#1F2A37' },
  body: { paddingHorizontal: 24 },
  pokemonCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 12, minHeight: 84 },
  art: { width: 64, height: 64, marginRight: 12 },
  pokemonName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  pokemonNumber: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  choose: { flex: 1, textAlign: 'center', color: '#8A94A1', fontSize: 16, fontWeight: '600' },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  presets: { flexDirection: 'row' },
  presetScroll: { flexGrow: 0, flexShrink: 0 },
  numInput: {
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F3F6',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2A37',
  },
  natureButton: { backgroundColor: '#F1F3F6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  natureButtonName: { fontSize: 16, fontWeight: '600', color: '#1F2A37' },
  natureEffect: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  evCount: { fontSize: 12, color: '#8A94A1', marginTop: 8 },
  evFull: { color: UP },
  hint: { textAlign: 'center', color: '#8A94A1', fontSize: 15, marginTop: 32 },
  tableHead: { flexDirection: 'row', alignItems: 'center', marginTop: 28, marginBottom: 6 },
  th: { fontSize: 11, color: '#8A94A1', fontWeight: '600', textAlign: 'center' },
  rowWrap: { marginBottom: 8 },
  tableRow: { flexDirection: 'row', alignItems: 'center' },
  colName: { flex: 1, textAlign: 'left' },
  colBase: { width: 40, textAlign: 'center' },
  colInput: { width: 50, alignItems: 'center' },
  colResult: { width: 52, textAlign: 'right' },
  statName: { fontSize: 14, color: '#4B5563', fontWeight: '600' },
  base: { fontSize: 14, color: '#8A94A1' },
  result: { fontSize: 18, fontWeight: '800', color: '#1F2A37' },
  track: { height: 4, borderRadius: 2, backgroundColor: '#EEF1F4', overflow: 'hidden', marginTop: 4 },
  fill: { height: '100%', borderRadius: 2, backgroundColor: ACCENT },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1F2A37' },
  cancel: { color: ACCENT, fontSize: 16, fontWeight: '600' },
  natureRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF1F4',
  },
  natureName: { fontSize: 16, fontWeight: '600', color: '#1F2A37' },
});
