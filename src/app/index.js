import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokedexList } from '../api/pokeapi';
import PokemonTile from '../components/PokemonTile';
import { PokeballWatermark } from '../components/Icons';

const GAP = 10;

export default function PokedexScreen() {
  const insets = useSafeAreaInsets();
  const { data, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = usePokedexList();

  const pokemon = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.cell}>
        <PokemonTile id={item.id} name={item.name} />
      </View>
    ),
    []
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <PokeballWatermark size={260} color="#1F2A37" opacity={0.04} style={[styles.headerBall, { top: insets.top - 90 }]} />

      <FlashList
        data={pokemon}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        contentContainerStyle={{ paddingHorizontal: 20 - GAP / 2, paddingBottom: insets.bottom + 24 }}
        ListHeaderComponent={<Text style={styles.title}>Pokédex</Text>}
        ListEmptyComponent={
          isPending ? (
            <ActivityIndicator style={styles.status} color="#6C79DB" />
          ) : error ? (
            <Pressable onPress={() => refetch()} style={styles.status}>
              <Text style={styles.errorText}>Couldn't reach PokeAPI. Tap to retry.</Text>
            </Pressable>
          ) : null
        }
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.footer} color="#6C79DB" /> : null}
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
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2A37',
    marginTop: 28,
    marginBottom: 20,
    marginHorizontal: GAP / 2,
  },
  cell: {
    padding: GAP / 2,
  },
  status: {
    marginTop: 60,
    alignItems: 'center',
  },
  errorText: {
    color: '#5B6573',
    fontSize: 15,
  },
  footer: {
    marginVertical: 20,
  },
});
