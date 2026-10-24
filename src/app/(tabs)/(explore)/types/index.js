import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTypes } from '../../../../api/pokeapi';
import { countDexPokemon } from '../../../../lib/typeInfo';
import { formatName } from '../../../../lib/format';
import { ALL_TYPES, typeColor } from '../../../../lib/types';
import { PokeballWatermark } from '../../../../components/Icons';
import HubBack from '../../../../components/HubBack';
import ScreenTitle from '../../../../components/ScreenTitle';

const GAP = 12;

function TypeTile({ type, data }) {
  const count = data ? countDexPokemon(data) : null;
  return (
    <Pressable
      onPress={() => router.push(`/types/${type}`)}
      style={({ pressed }) => [styles.tile, { backgroundColor: typeColor(type) }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${formatName(type)} type`}
    >
      <PokeballWatermark size={90} style={styles.ball} />
      <Text style={styles.name}>{formatName(type)}</Text>
      <Text style={styles.count}>{count != null ? `${count} Pokémon` : ' '}</Text>
    </Pressable>
  );
}

export default function TypesScreen() {
  const insets = useSafeAreaInsets();
  // 18 small requests, cached for the session; tiles fill in their counts as they arrive.
  const queries = useTypes(ALL_TYPES);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}>
        <HubBack fallback="/explore" />
        <ScreenTitle>Types</ScreenTitle>
        <View style={styles.grid}>
          {ALL_TYPES.map((type, i) => (
            <View key={type} style={styles.cell}>
              <TypeTile type={type} data={queries[i]?.data} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '50%',
    padding: GAP / 2,
  },
  tile: {
    height: 84,
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  ball: {
    position: 'absolute',
    right: -18,
    bottom: -18,
  },
  name: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  count: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
});
