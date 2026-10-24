import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { BackArrow } from './Icons';

/** Back arrow for screens that used to be tab roots and now sit one level inside a hub. */
export default function HubBack({ fallback }) {
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
      hitSlop={12}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel="Back"
    >
      <BackArrow color="#1F2A37" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    marginTop: 8,
    marginHorizontal: 5,
    marginBottom: -14, // ScreenTitle brings its own top margin
  },
});
