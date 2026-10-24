import { useMemo } from 'react';
import { router } from 'expo-router';
import { useAbilityList } from '../../../../api/pokeapi';
import { formatName } from '../../../../lib/format';
import BrowseList from '../../../../components/browse/BrowseList';

export default function AbilitiesScreen() {
  const { data, isPending, error, refetch } = useAbilityList();
  const items = useMemo(
    () =>
      (data ?? [])
        .filter((a) => a.id < 10000)
        .map((a) => ({ key: a.name, label: formatName(a.name), onPress: () => router.push(`/abilities/${a.name}`) })),
    [data]
  );
  return (
    <BrowseList title="Abilities" placeholder="Search abilities" items={items} loading={isPending} error={error} onRetry={refetch} />
  );
}
