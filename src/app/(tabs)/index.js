import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokedexList } from '../../api/pokeapi';
import PokemonGrid from '../../components/PokemonGrid';
import ScreenTitle from '../../components/ScreenTitle';
import { PokeballWatermark } from '../../components/Icons';

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
      <PokeballWatermark size={260} color="#1F2A37" opacity={0.04} style={[styles.headerBall, { top: insets.top - 90 }]} />
      <PokemonGrid
        data={pokemon}
        header={<ScreenTitle>Pokédex</ScreenTitle>}
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
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBall: {
    position: 'absolute',
    right: -70,
  },
});
