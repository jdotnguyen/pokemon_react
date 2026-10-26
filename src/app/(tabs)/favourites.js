import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavourites } from '../../lib/favourites';
import PokemonGrid from '../../components/PokemonGrid';
import ScreenTitle from '../../components/ScreenTitle';
import HubBack from '../../components/HubBack';
import PageWatermark from '../../components/PageWatermark';

export default function FavouritesScreen() {
  const insets = useSafeAreaInsets();
  const favourites = useFavourites();
  const data = useMemo(() => [...favourites].sort((a, b) => a - b).map((id) => ({ id })), [favourites]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <PageWatermark />
      <PokemonGrid
        data={data}
        header={
          <View>
            <HubBack to="/" />
            <ScreenTitle>Favourites</ScreenTitle>
          </View>
        }
        emptyText="Tap the heart on any Pokémon to keep it here."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
