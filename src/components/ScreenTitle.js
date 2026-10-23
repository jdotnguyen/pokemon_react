import { StyleSheet, Text } from 'react-native';
import { GRID_GAP } from './PokemonGrid';

export default function ScreenTitle({ children }) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2A37',
    marginTop: 28,
    marginBottom: 20,
    marginHorizontal: GRID_GAP / 2,
  },
});
