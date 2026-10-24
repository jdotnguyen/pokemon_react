import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMachines, useMove } from '../../../../api/pokeapi';
import { cleanEffect, dexRows, machineLabel } from '../../../../lib/browse';
import { englishEntry, formatName } from '../../../../lib/format';
import { generationLabel, versionGroupLabel } from '../../../../lib/regions';
import { typeColor } from '../../../../lib/types';
import DetailList from '../../../../components/browse/DetailList';
import { Para, SectionTitle, StatBox } from '../../../../components/detail/shared';

function TmList({ machines }) {
  const results = useMachines(machines.map((m) => m.machine.url));
  const lines = results
    .map((q, i) => (q.data ? { tm: machineLabel(q.data.item.name), group: machines[i].version_group.name } : null))
    .filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <>
      <SectionTitle>TM / HM</SectionTitle>
      {lines.map((l) => (
        <View key={`${l.tm}-${l.group}`} style={styles.tmRow}>
          <Text style={styles.tm}>{l.tm}</Text>
          <Text style={styles.tmGame}>{versionGroupLabel(l.group)}</Text>
        </View>
      ))}
    </>
  );
}

export default function MoveScreen() {
  const { name } = useLocalSearchParams();
  const { data, isPending, error, refetch } = useMove(name);

  const title = englishEntry(data?.names, 'name') ?? formatName(name);
  const effect = cleanEffect(englishEntry(data?.effect_entries, 'effect'), data?.effect_chance);
  const rows = dexRows(data?.learned_by_pokemon);

  return (
    <DetailList
      title={title}
      subtitle={data?.generation ? `Introduced in ${generationLabel(data.generation.name)}` : undefined}
      loading={isPending}
      error={error}
      onRetry={refetch}
      rows={rows}
      rowsTitle="Learned by"
    >
      {data ? (
        <>
          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: typeColor(data.type.name) }]}>
              <Text style={styles.tagText}>{formatName(data.type.name)}</Text>
            </View>
            <View style={[styles.tag, styles.tagPlain]}>
              <Text style={[styles.tagText, styles.tagTextPlain]}>{formatName(data.damage_class.name)}</Text>
            </View>
          </View>
          <StatBox
            items={[
              { label: 'Power', value: data.power },
              { label: 'Accuracy', value: data.accuracy != null ? `${data.accuracy}%` : null },
              { label: 'PP', value: data.pp },
              { label: 'Priority', value: data.priority > 0 ? `+${data.priority}` : data.priority },
            ]}
          />
          {effect ? <Para>{effect}</Para> : null}
          {data.target ? <Para style={styles.target}>Target: {formatName(data.target.name)}</Para> : null}
          {data.machines?.length > 0 ? <TmList machines={data.machines} /> : null}
        </>
      ) : null}
    </DetailList>
  );
}

const styles = StyleSheet.create({
  tags: { flexDirection: 'row', gap: 8, marginTop: 14 },
  tag: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5 },
  tagPlain: { backgroundColor: '#F1F3F6' },
  tagText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  tagTextPlain: { color: '#5B6573' },
  target: { color: '#8A94A1', marginTop: 8 },
  tmRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  tm: { width: 64, fontSize: 14, fontWeight: '700', color: '#1F2A37' },
  tmGame: { fontSize: 14, color: '#5B6573' },
});
