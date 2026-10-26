import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { formatName, padId } from '../lib/format';
import { ChevronRight } from './Icons';
import { colors } from '../theme';
import { artworkUrl } from '../lib/sprites';

/** Compact Pokémon row (thumbnail, name, number, optional note) that opens the detail screen. */
export default function PokemonRow({ id, name, note }) {
  return (
    <Pressable
      onPress={() => router.push(`/pokemon/${id}`)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={formatName(name)}
    >
      <View style={styles.avatar}>
        <Image source={{ uri: artworkUrl(id) }} style={styles.image} contentFit="contain" cachePolicy="memory-disk" />
      </View>
      <View style={styles.text}>
        <Text style={styles.name}>{formatName(name)}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
      <Text style={styles.number}>{padId(id)}</Text>
      <ChevronRight />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  pressed: { opacity: 0.6 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.fill, marginRight: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  text: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.ink },
  note: { fontSize: 12, color: colors.muted, marginTop: 1 },
  number: { fontSize: 13, color: colors.muted, marginRight: 6 },
});
