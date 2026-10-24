import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { artworkUrl, formatName, padId } from '../lib/format';
import { ChevronRight } from './Icons';

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
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F3F6', marginRight: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  text: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#1F2A37' },
  note: { fontSize: 12, color: '#8A94A1', marginTop: 1 },
  number: { fontSize: 13, color: '#8A94A1', marginRight: 6 },
});
