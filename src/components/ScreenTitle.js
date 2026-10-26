import { StyleSheet, Text } from 'react-native';
import { GRID_GAP } from './PokemonGrid';
import { colors } from '../theme';

export default function ScreenTitle({ children, style }) {
  return (
    <Text style={[styles.title, style]} accessibilityRole="header">
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 28,
    marginBottom: 20,
    marginHorizontal: GRID_GAP / 2,
  },
});
