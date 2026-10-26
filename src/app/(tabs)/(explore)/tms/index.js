import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useItem, useMachineItems, useMachines } from '../../../../api/pokeapi';
import { machineLabel } from '../../../../lib/browse';
import { formatName } from '../../../../lib/format';
import { versionGroupLabel } from '../../../../lib/regions';
import BrowseList from '../../../../components/browse/BrowseList';
import { ChevronRight } from '../../../../components/Icons';
import { colors } from '../../../../theme';

// Resolves the move a TM teaches in its newest game (2 small cached requests per visible row).
function TmRow({ name }) {
  const item = useItem(name);
  const latest = item.data?.machines?.[item.data.machines.length - 1];
  const [machine] = useMachines(latest ? [latest.machine.url] : []);
  const move = machine?.data?.move?.name;

  return (
    <Pressable
      onPress={() => router.push(`/items/${name}`)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={machineLabel(name)}
    >
      <Text style={styles.tm}>{machineLabel(name)}</Text>
      <View style={styles.text}>
        <Text style={styles.move}>{move ? formatName(move) : ' '}</Text>
        {latest ? <Text style={styles.game}>{versionGroupLabel(latest.version_group.name)}</Text> : null}
      </View>
      <ChevronRight />
    </Pressable>
  );
}

export default function TmsScreen() {
  const { data, isPending, error, refetch } = useMachineItems();
  const items = useMemo(
    () =>
      (data ?? [])
        .filter((i) => /^(tm|hm|tr)\d+$/.test(i.name))
        .map((i) => ({ key: i.name, name: i.name, label: machineLabel(i.name) })),
    [data]
  );
  return (
    <BrowseList
      title="TMs & HMs"
      placeholder="Search TM number"
      items={items}
      loading={isPending}
      error={error}
      onRetry={refetch}
      windowSize={5}
      renderRow={(item) => <TmRow name={item.name} />}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  pressed: { opacity: 0.6 },
  tm: { width: 64, fontSize: 15, fontWeight: '800', color: colors.accent },
  text: { flex: 1, marginRight: 8 },
  move: { fontSize: 15, fontWeight: '600', color: colors.ink },
  game: { fontSize: 12, color: colors.muted, marginTop: 1 },
});
