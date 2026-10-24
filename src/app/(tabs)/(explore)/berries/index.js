import { useMemo } from 'react';
import { router } from 'expo-router';
import { useBerryList } from '../../../../api/pokeapi';
import { formatName, itemSpriteUrl } from '../../../../lib/format';
import BrowseList from '../../../../components/browse/BrowseList';

export default function BerriesScreen() {
  const { data, isPending, error, refetch } = useBerryList();
  const items = useMemo(
    () =>
      (data ?? []).map((b) => ({
        key: b.name,
        label: `${formatName(b.name)} Berry`,
        sub: `#${b.id}`,
        image: itemSpriteUrl(`${b.name}-berry`),
        onPress: () => router.push(`/berries/${b.name}`),
      })),
    [data]
  );
  return (
    <BrowseList title="Berries" placeholder="Search berries" items={items} loading={isPending} error={error} onRetry={refetch} />
  );
}
