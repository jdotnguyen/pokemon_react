import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokemonList, useTypes } from '../api/pokeapi';
import { formatName } from '../lib/format';
import {
  MAX_TEAM,
  createTeam,
  deleteTeam,
  removeFromTeam,
  renameTeam,
  replaceInTeam,
  setActiveTeam,
  sharedWeaknesses,
  teamCoverage,
  teamDefense,
  teamToText,
  useTeam,
  useTeams,
} from '../lib/team';
import { typeColor } from '../lib/types';
import HubBack from '../components/HubBack';
import PageWatermark from '../components/PageWatermark';
import ScreenTitle from '../components/ScreenTitle';
import PokemonPicker from '../components/PokemonPicker';
import TextPrompt from '../components/TextPrompt';
import { Chip, SectionTitle } from '../components/ui';
import { colors } from '../theme';
import { artworkUrl } from '../lib/sprites';

const CELL = 30;
const COL_GAP = 2; // margin each side, so columns are 4px apart without widening the grid

const CELL_STYLE = {
  4: { bg: '#C0392B', fg: '#fff', text: '4' },
  2: { bg: '#F7A3A3', fg: '#7A1F1F', text: '2' },
  0.5: { bg: '#B5E8CB', fg: '#1D6B45', text: '½' },
  0.25: { bg: '#4CC38A', fg: '#fff', text: '¼' },
  0: { bg: colors.placeholder, fg: '#fff', text: '0' },
};

function Slot({ id, index, onPress }) {
  return (
    <View style={styles.slotWrap}>
      <Pressable
        onPress={onPress}
        style={[styles.slot, id == null && styles.slotEmpty]}
        accessibilityRole="button"
        accessibilityLabel={id == null ? 'Add Pokémon' : 'Change Pokémon'}
      >
        {id == null ? (
          <Text style={styles.plus}>+</Text>
        ) : (
          <Image source={{ uri: artworkUrl(id) }} style={styles.slotArt} contentFit="contain" cachePolicy="memory-disk" />
        )}
      </Pressable>
      {id != null && (
        <Pressable
          onPress={() => removeFromTeam(id)}
          hitSlop={8}
          style={styles.remove}
          accessibilityRole="button"
          accessibilityLabel="Remove from team"
        >
          <Text style={styles.removeText}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

function Cell({ multiplier }) {
  const style = CELL_STYLE[multiplier];
  return (
    <View style={[styles.cell, style && { backgroundColor: style.bg }]}>
      {style ? <Text style={[styles.cellText, { color: style.fg }]}>{style.text}</Text> : null}
    </View>
  );
}

export default function TeamScreen() {
  const insets = useSafeAreaInsets();
  const team = useTeam();
  const { teams, activeId } = useTeams();
  const activeTeam = teams.find((t) => t.id === activeId);
  const [picking, setPicking] = useState(null); // slot index being filled/replaced
  const [prompt, setPrompt] = useState(null); // 'new' | 'rename' | null

  const members = usePokemonList(team);
  const memberTypes = members.map((q) => q.data?.types.map((t) => t.type.name));
  const membersReady = team.length > 0 && memberTypes.every(Boolean);

  const typeNames = [...new Set(memberTypes.flatMap((t) => t ?? []))];
  const typeQueries = useTypes(typeNames);
  const typeMap = Object.fromEntries(typeNames.map((n, i) => [n, typeQueries[i]?.data]));
  const ready = membersReady && typeQueries.every((q) => q.data);
  const failed = members.some((q) => q.error) || typeQueries.some((q) => q.error);

  const rows = ready ? teamDefense(memberTypes, typeMap) : [];
  const shared = sharedWeaknesses(rows);
  const coverage = ready ? teamCoverage(memberTypes, typeMap) : [];
  const gaps = coverage.filter((c) => !c.covered);

  const share = () => {
    const details = team.map((id, i) => ({
      name: members[i]?.data?.name ?? `#${id}`,
      types: memberTypes[i],
    }));
    Share.share({ message: teamToText(activeTeam.name, details) }).catch(() => {});
  };

  const confirmDelete = () =>
    Alert.alert(`Delete ${activeTeam.name}?`, 'This removes the team and its Pokémon list.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTeam(activeTeam.id) },
    ]);

  const onPick = (id) => {
    replaceInTeam(picking, id);
    setPicking(null);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <PageWatermark />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 40 }}>
        <View style={styles.header}>
          <HubBack fallback="/tools" />
          <ScreenTitle>Team matchups</ScreenTitle>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamChips} contentContainerStyle={styles.teamChipsContent}>
          {teams.map((t) => (
            <Chip key={t.id} label={t.name} active={t.id === activeId} onPress={() => setActiveTeam(t.id)} />
          ))}
          <Chip label="+ New" onPress={() => setPrompt('new')} />
        </ScrollView>
        <View style={styles.teamActions}>
          <Text style={styles.action} onPress={() => setPrompt('rename')} accessibilityRole="button">
            Rename
          </Text>
          <Text style={[styles.action, team.length === 0 && styles.actionOff]} onPress={team.length ? share : undefined} accessibilityRole="button">
            Share
          </Text>
          <Text style={[styles.action, styles.actionDanger]} onPress={confirmDelete} accessibilityRole="button">
            Delete
          </Text>
        </View>

        <View style={styles.slots}>
          {Array.from({ length: MAX_TEAM }, (_, i) => (
            <Slot key={i} id={team[i]} index={i} onPress={() => setPicking(i)} />
          ))}
        </View>

        {team.length === 0 && (
          <Text style={styles.hint}>Add up to 6 Pokémon to see your team's shared weaknesses and type coverage.</Text>
        )}
        {team.length > 0 && !ready && !failed && <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />}
        {failed && <Text style={styles.hint}>Couldn't load team data. Check your connection.</Text>}

        {ready && (
          <View style={styles.body}>
            <SectionTitle>Watch out for</SectionTitle>
            {shared.length === 0 ? (
              <Text style={styles.note}>No type hits two or more of your team harder than they resist it.</Text>
            ) : (
              <View style={styles.chips}>
                {shared.map((r) => (
                  <View key={r.type} style={[styles.chip, { backgroundColor: typeColor(r.type) }]}>
                    <Text style={styles.chipText}>
                      {formatName(r.type)} · {r.weak} weak
                      {r.resist > 0 ? `, ${r.resist} resist` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <SectionTitle>Defence by type</SectionTitle>
            <View style={styles.matrixHead}>
              <View style={styles.typeCol} />
              {team.map((id) => (
                <Image key={id} source={{ uri: artworkUrl(id) }} style={styles.headArt} contentFit="contain" cachePolicy="memory-disk" />
              ))}
              <View style={styles.spacer} />
              <Text style={styles.countHead}>Weak</Text>
              <Text style={styles.countHead}>Res.</Text>
            </View>
            {rows.map((r) => (
              <View key={r.type} style={styles.matrixRow}>
                <View style={styles.typeCol}>
                  <View style={[styles.typeChip, { backgroundColor: typeColor(r.type) }]}>
                    <Text style={styles.typeChipText}>{formatName(r.type)}</Text>
                  </View>
                </View>
                {r.cells.map((m, i) => (
                  <Cell key={team[i]} multiplier={m} />
                ))}
                <View style={styles.spacer} />
                <Text style={[styles.count, r.weak > r.resist && styles.countBad]}>{r.weak || ''}</Text>
                <Text style={[styles.count, r.resist > r.weak && styles.countGood]}>{r.resist || ''}</Text>
              </View>
            ))}

            <SectionTitle>Offensive coverage</SectionTitle>
            <Text style={styles.note}>
              Types your team's own types hit super effectively. Based on type only, not the moves they actually know.
            </Text>
            <View style={[styles.chips, { marginTop: 10 }]}>
              {coverage.map((c) => (
                <View
                  key={c.type}
                  style={[styles.chip, c.covered ? { backgroundColor: typeColor(c.type) } : styles.chipMissing]}
                >
                  <Text style={[styles.chipText, !c.covered && styles.chipTextMissing]}>{formatName(c.type)}</Text>
                </View>
              ))}
            </View>
            {gaps.length > 0 && (
              <Text style={[styles.note, { marginTop: 10 }]}>
                Gaps: {gaps.map((g) => formatName(g.type)).join(', ')}.
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <TextPrompt
        visible={prompt != null}
        title={prompt === 'rename' ? 'Rename team' : 'New team'}
        initial={prompt === 'rename' ? activeTeam?.name : ''}
        placeholder="Team name"
        confirmLabel={prompt === 'rename' ? 'Rename' : 'Create'}
        onClose={() => setPrompt(null)}
        onSubmit={(name) => {
          if (prompt === 'rename') renameTeam(activeTeam.id, name);
          else createTeam(name);
          setPrompt(null);
        }}
      />
      <PokemonPicker visible={picking != null} onClose={() => setPicking(null)} onPick={onPick} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 19 }, // HubBack/ScreenTitle add 5 each, lining up with the 24px body
  teamChips: { flexGrow: 0, flexShrink: 0 },
  teamChipsContent: { paddingHorizontal: 24 },
  teamActions: { flexDirection: 'row', gap: 20, paddingHorizontal: 24, marginTop: 10, marginBottom: 16 },
  action: { fontSize: 13, fontWeight: '600', color: colors.accent },
  actionOff: { opacity: 0.35 },
  actionDanger: { color: colors.danger },
  slots: { flexDirection: 'row', paddingHorizontal: 24, gap: 8 },
  slotWrap: { flex: 1 },
  slot: {
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmpty: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, backgroundColor: '#FAFBFC' },
  slotArt: { width: '88%', height: '88%' },
  plus: { fontSize: 22, color: colors.placeholder },
  remove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: '#fff', fontSize: 13, lineHeight: 15, fontWeight: '700' },
  hint: { textAlign: 'center', color: colors.muted, fontSize: 15, marginTop: 36, paddingHorizontal: 32 },
  body: { paddingHorizontal: 24 },
  note: { fontSize: 13, lineHeight: 19, color: '#6B7480' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  chipMissing: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  chipTextMissing: { color: colors.faint },
  matrixHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  matrixRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  typeCol: { width: 74 },
  headArt: { width: CELL, height: CELL, marginHorizontal: COL_GAP },
  spacer: { flex: 1 },
  cell: {
    width: CELL,
    height: 26,
    marginHorizontal: COL_GAP,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { fontSize: 12, fontWeight: '700' },
  typeChip: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  typeChipText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  countHead: { width: 32, textAlign: 'center', fontSize: 11, color: colors.muted },
  count: { width: 32, textAlign: 'center', fontSize: 13, fontWeight: '600', color: colors.muted },
  countBad: { color: colors.danger, fontWeight: '800' },
  countGood: { color: '#1E9E6A', fontWeight: '800' },
});
