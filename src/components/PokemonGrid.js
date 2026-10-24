import { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PokemonTile from './PokemonTile';
import { ACCENT } from './detail/shared';

export const GRID_GAP = 10;

/**
 * Virtualized two-column grid of Pokémon tiles. `data` items are { id, name?, number? }.
 * Shared by the Pokédex, Favourites and Search tabs.
 */
export default function PokemonGrid({
  data,
  header,
  loading,
  error,
  onRetry,
  emptyText,
  onEndReached,
  loadingMore,
  keyboardDismissMode,
  contentInsetAdjustmentBehavior,
}) {
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.cell}>
        <PokemonTile id={item.id} name={item.name} number={item.number} badge={item.badge} />
      </View>
    ),
    []
  );

  return (
    <FlashList
      data={data}
      numColumns={2}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.6}
      keyboardDismissMode={keyboardDismissMode}
      contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
      // Leaves room for the floating tab bar on top of the safe area.
      contentContainerStyle={{ paddingHorizontal: 20 - GRID_GAP / 2, paddingBottom: insets.bottom + 90 }}
      ListHeaderComponent={header}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator style={styles.status} color={ACCENT} />
        ) : error ? (
          <Pressable onPress={onRetry} style={styles.status}>
            <Text style={styles.statusText}>Couldn't reach PokeAPI. Tap to retry.</Text>
          </Pressable>
        ) : emptyText ? (
          <View style={styles.status}>
            <Text style={styles.statusText}>{emptyText}</Text>
          </View>
        ) : null
      }
      ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footer} color={ACCENT} /> : null}
    />
  );
}

const styles = StyleSheet.create({
  cell: {
    padding: GRID_GAP / 2,
  },
  status: {
    marginTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  statusText: {
    color: '#5B6573',
    fontSize: 15,
    textAlign: 'center',
  },
  footer: {
    marginVertical: 20,
  },
});
