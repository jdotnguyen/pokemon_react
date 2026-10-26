import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PokeballWatermark } from './Icons';
import { colors } from '../theme';

/**
 * The faint Pokéball tucked into the top-right corner of white screens. Render it as the first child
 * of the screen (before the scroll view) so it stays put behind the content.
 */
export default function PageWatermark() {
  const insets = useSafeAreaInsets();
  return <PokeballWatermark size={260} color={colors.ink} opacity={0.04} style={[styles.ball, { top: insets.top - 90 }]} />;
}

const styles = StyleSheet.create({
  ball: { position: 'absolute', right: -70 },
});
