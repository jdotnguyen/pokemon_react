import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokedexList } from '../api/pokeapi';
import HubBack from '../components/HubBack';
import PokemonGrid from '../components/PokemonGrid';
import ScreenTitle from '../components/ScreenTitle';
import PageWatermark from '../components/PageWatermark';

/** The full National Dex grid (reached from Home → Pokédex). */
export default function PokedexScreen() {
  const insets = useSafeAreaInsets();
  const { data, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = usePokedexList();

  const pokemon = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <PageWatermark />
      <PokemonGrid
        data={pokemon}
        header={
          <View>
            <HubBack fallback="/" />
            <ScreenTitle>Pokédex</ScreenTitle>
          </View>
        }
        loading={isPending}
        error={error}
        onRetry={() => refetch()}
        onEndReached={loadMore}
        loadingMore={isFetchingNextPage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
});
