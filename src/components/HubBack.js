import { StyleSheet } from 'react-native';
import BackButton from './BackButton';
import { colors } from '../theme';

/** Back arrow that sits above a ScreenTitle on white screens. Takes BackButton's `fallback` / `to`. */
export default function HubBack(props) {
  return <BackButton {...props} color={colors.ink} style={styles.button} />;
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    marginTop: 8,
    marginHorizontal: 5,
    marginBottom: -14, // ScreenTitle brings its own top margin
  },
});
