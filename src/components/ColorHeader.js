import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from './BackButton';
import { PokeballWatermark } from './Icons';

/**
 * Header for the type-coloured screens (a type, a region): back arrow, faint Poké Ball, big white title.
 * `children` go under the title (subtitle lines). Render it first inside a screen whose background
 * is the colour, followed by the white sheet.
 */
export default function ColorHeader({ title, fallback, children }) {
  const insets = useSafeAreaInsets();
  return (
    <>
      <PokeballWatermark size={200} opacity={0.16} style={[styles.ball, { top: insets.top - 10 }]} />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton fallback={fallback} style={styles.back} />
        <Text style={styles.title}>{title}</Text>
        {children}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  ball: { position: 'absolute', right: -40 },
  header: { paddingHorizontal: 24, paddingBottom: 24 },
  back: { alignSelf: 'flex-start', marginBottom: 16 },
  title: { color: '#fff', fontSize: 34, fontWeight: '800' },
});
