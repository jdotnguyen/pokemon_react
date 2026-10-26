import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useMoveIndex, useMoveList } from '../../../../api/pokeapi';
import { formatName } from '../../../../lib/format';
import { ALL_TYPES, typeColor } from '../../../../lib/types';
import BrowseList from '../../../../components/browse/BrowseList';
import { Chip } from '../../../../components/ui';

const CLASSES = ['physical', 'special', 'status'];

export default function MovesScreen() {
  const { data, isPending, error, refetch } = useMoveList();
  const index = useMoveIndex();
  const [type, setType] = useState(null);
  const [cls, setCls] = useState(null);

  const items = useMemo(
    () =>
      (data ?? [])
        .filter((m) => m.id < 10000)
        .map((m) => {
          const info = index.get(m.name);
          return {
            key: m.name,
            label: formatName(m.name),
            sub: info?.damageClass ? formatName(info.damageClass) : undefined,
            right: info?.type ? formatName(info.type) : undefined,
            rightColor: info?.type ? typeColor(info.type) : undefined,
            type: info?.type,
            cls: info?.damageClass,
            onPress: () => router.push(`/moves/${m.name}`),
          };
        }),
    [data, index]
  );

  const filter = useCallback((m) => (!type || m.type === type) && (!cls || m.cls === cls), [type, cls]);

  const header = (
    <View style={styles.filters}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {CLASSES.map((c) => (
          <Chip key={c} label={formatName(c)} active={cls === c} onPress={() => setCls(cls === c ? null : c)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {ALL_TYPES.map((t) => (
          <Chip key={t} label={formatName(t)} color={typeColor(t)} active={type === t} onPress={() => setType(type === t ? null : t)} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <BrowseList
      title="Moves"
      placeholder="Search moves"
      items={items}
      loading={isPending}
      error={error}
      onRetry={refetch}
      filter={filter}
      header={header}
    />
  );
}

const styles = StyleSheet.create({
  filters: { marginHorizontal: 5, marginBottom: 6 },
  scroll: { flexGrow: 0, flexShrink: 0, marginBottom: 10 },
});
