import { Pressable, StyleSheet } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { cryUrl } from '../../lib/format';
import { Speaker } from '../Icons';

/** Plays the Pokémon's cry. Requires `expo-audio` (npx expo install expo-audio). */
export default function CryButton({ pokemon }) {
  const url = cryUrl(pokemon);
  const player = useAudioPlayer(url ? { uri: url } : null);

  const play = async () => {
    try {
      await player.seekTo(0);
      player.play();
    } catch {
      // Cries are .ogg; some platforms (iOS) can't decode them. Fail quietly.
    }
  };

  if (!url) return null;
  return (
    <Pressable
      onPress={play}
      hitSlop={8}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel="Play cry"
    >
      <Speaker />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
