import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Speaker } from '../Icons';
import { cryUrl } from '../../lib/sprites';

/**
 * Web version of CryButton: a plain HTML <audio> element instead of expo-audio, which pulled ~46 KB
 * (player, recorder, playlist and expo-asset) into the Pokémon page for one sound.
 */
export default function CryButton({ pokemon }) {
  const url = cryUrl(pokemon);
  const audio = useRef(null);

  useEffect(() => {
    audio.current = url ? new Audio(url) : null;
    if (audio.current) audio.current.preload = 'none';
    return () => audio.current?.pause();
  }, [url]);

  const play = () => {
    const a = audio.current;
    if (!a) return;
    a.currentTime = 0;
    // Cries are .ogg; Safari can't decode them. Fail quietly.
    a.play().catch(() => {});
  };

  if (!url) return null;
  return (
    <Pressable onPress={play} hitSlop={8} style={styles.button} accessibilityRole="button" accessibilityLabel="Play cry">
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
