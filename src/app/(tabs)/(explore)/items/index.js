import { useMemo } from 'react';
import { router } from 'expo-router';
import { useItemList } from '../../../../api/pokeapi';
import { formatName } from '../../../../lib/format';
import BrowseList from '../../../../components/browse/BrowseList';
import { itemSpriteUrl } from '../../../../lib/sprites';

export default function ItemsScreen() {
  const { data, isPending, error, refetch } = useItemList();
  const items = useMemo(
    () =>
      (data ?? []).map((i) => ({
        key: i.name,
        label: formatName(i.name),
        image: itemSpriteUrl(i.name),
        onPress: () => router.push(`/items/${i.name}`),
      })),
    [data]
  );
  return (
    <BrowseList title="Items" placeholder="Search items" items={items} loading={isPending} error={error} onRetry={refetch} windowSize={7} />
  );
}
