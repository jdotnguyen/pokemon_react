import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useItem, useMachines } from '../../../../api/pokeapi';
import { cleanEffect, dexRows, machineLabel } from '../../../../lib/browse';
import { englishEntry, formatName, idFromUrl } from '../../../../lib/format';
import { versionGroupLabel } from '../../../../lib/regions';
import DetailList from '../../../../components/browse/DetailList';
import { ChevronRight } from '../../../../components/Icons';
import { Para, SectionTitle, StatBox } from '../../../../components/ui';
import { colors } from '../../../../theme';
import { itemSpriteUrl } from '../../../../lib/sprites';

// What a TM / HM teaches, per game.
function TeachesList({ machines }) {
  const results = useMachines(machines.map((m) => m.machine.url));
  const lines = results
    .map((q, i) =>
      q.data
        ? { move: q.data.move.name, group: machines[i].version_group.name, groupId: idFromUrl(machines[i].version_group.url) }
        : null
    )
    .filter(Boolean)
    .sort((a, b) => b.groupId - a.groupId);
  if (lines.length === 0) return null;
  return (
    <>
      <SectionTitle>Teaches</SectionTitle>
      {lines.map((l) => (
        <Pressable
          key={`${l.move}-${l.group}`}
          onPress={() => router.push(`/moves/${l.move}`)}
          style={styles.teachRow}
          accessibilityRole="button"
        >
          <View style={styles.teachText}>
            <Text style={styles.teachMove}>{formatName(l.move)}</Text>
            <Text style={styles.teachGame}>{versionGroupLabel(l.group)}</Text>
          </View>
          <ChevronRight />
        </Pressable>
      ))}
    </>
  );
}

export default function ItemScreen() {
  const { name } = useLocalSearchParams();
  const { data, isPending, error, refetch } = useItem(name);

  const isMachine = /^(tm|hm|tr)\d+$/.test(name ?? '');
  const title = isMachine ? machineLabel(name) : (englishEntry(data?.names, 'name') ?? formatName(name));
  const effect =
    cleanEffect(englishEntry(data?.effect_entries, 'effect')) ??
    cleanEffect([...(data?.flavor_text_entries ?? [])].reverse().find((e) => e.language?.name === 'en')?.text);
  const rows = dexRows(data?.held_by_pokemon);

  return (
    <DetailList
      title={title}
      subtitle={data?.category ? formatName(data.category.name) : undefined}
      backFallback={isMachine ? '/tms' : '/items'}
      loading={isPending}
      error={error}
      onRetry={refetch}
      rows={rows}
      rowsTitle="Held in the wild by"
    >
      {data ? (
        <>
          <Image source={{ uri: data.sprites?.default ?? itemSpriteUrl(name) }} style={styles.sprite} contentFit="contain" />
          <StatBox
            items={[
              { label: 'Cost', value: data.cost > 0 ? `₽${data.cost}` : '—' },
              { label: 'Fling power', value: data.fling_power },
            ]}
          />
          {effect ? <Para>{effect}</Para> : null}
          {data.attributes?.length > 0 ? (
            <Para style={styles.attrs}>{data.attributes.map((a) => formatName(a.name)).join(' · ')}</Para>
          ) : null}
          {data.machines?.length > 0 ? <TeachesList machines={data.machines} /> : null}
        </>
      ) : null}
    </DetailList>
  );
}

const styles = StyleSheet.create({
  sprite: { width: 72, height: 72, marginTop: 14 },
  attrs: { color: colors.muted, fontSize: 12, marginTop: 8 },
  teachRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  teachText: { flex: 1 },
  teachMove: { fontSize: 15, fontWeight: '600', color: colors.ink },
  teachGame: { fontSize: 12, color: colors.muted, marginTop: 1 },
});
