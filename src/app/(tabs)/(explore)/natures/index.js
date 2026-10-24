import { useMemo } from 'react';
import { router } from 'expo-router';
import { useNatures } from '../../../../api/pokeapi';
import { natureEffect, statShort } from '../../../../lib/browse';
import { formatName } from '../../../../lib/format';
import BrowseList from '../../../../components/browse/BrowseList';

export default function NaturesScreen() {
  const { list, natures } = useNatures();
  const loaded = natures.length > 0 && natures.every((q) => q.data);

  const items = useMemo(
    () =>
      natures
        .map((q) => q.data)
        .filter(Boolean)
        .map((n) => {
          const { up, down } = natureEffect(n);
          const likes = n.likes_flavor?.name;
          const hates = n.hates_flavor?.name;
          return {
            key: n.name,
            label: formatName(n.name),
            sub: up && down ? `Likes ${formatName(likes)} · dislikes ${formatName(hates)}` : 'Neutral — no stat change',
            right: up && down ? `+${statShort(up)}  −${statShort(down)}` : undefined,
            search: `${up ?? ''} ${down ?? ''}`,
            onPress: () => router.push({ pathname: '/calc', params: { nature: n.name } }),
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label)),
    // natures is a fresh array each render; the loaded flag is what actually changes the output.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loaded]
  );

  return (
    <BrowseList
      title="Natures"
      placeholder="Search natures or stats"
      items={items}
      loading={list.isPending || !loaded}
      error={list.error || natures.find((q) => q.error)?.error}
      onRetry={() => list.refetch()}
    />
  );
}
