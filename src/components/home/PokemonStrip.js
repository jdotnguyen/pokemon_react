import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { usePokemon } from '../../api/pokeapi';
import { artworkUrl, formatName } from '../../lib/format';
import { primaryColor } from '../../lib/types';

function StripItem({ id }) {
  const { data } = usePokemon(id);
  const types = data?.types.map((t) => t.type.name) ?? [];
  return (
    <Pressable
      onPress={() => router.push(`/pokemon/${id}`)}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={data ? formatName(data.name) : `Pokémon ${id}`}
    >
      <View style={[styles.avatar, { backgroundColor: primaryColor(types) }]}>
        <Image source={{ uri: artworkUrl(id) }} style={styles.art} contentFit="contain" cachePolicy="memory-disk" />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {data ? formatName(data.name) : ' '}
      </Text>
    </Pressable>
  );
}

/** Titled horizontal row of Pokémon (recently viewed, favourites...). Renders nothing when empty. */
export default function PokemonStrip({ title, ids, actionLabel, onAction }) {
  if (!ids || ids.length === 0) return null;
  return (
    <View>
      <View style={styles.head}>
        <Text style={styles.title}>{title}</Text>
        {actionLabel ? (
          <Text style={styles.action} onPress={onAction} accessibilityRole="button">
            {actionLabel}
          </Text>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.content}>
        {ids.map((id) => (
          <StripItem key={id} id={id} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '800', color: '#1F2A37' },
  action: { fontSize: 13, fontWeight: '700', color: '#6C79DB' },
  scroll: { flexGrow: 0, flexShrink: 0, marginHorizontal: -20 },
  content: { paddingHorizontal: 20, gap: 12 },
  item: { width: 78 },
  pressed: { opacity: 0.7 },
  avatar: { width: 78, height: 78, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  art: { width: 66, height: 66 },
  name: { fontSize: 12, fontWeight: '600', color: '#4B5563', textAlign: 'center', marginTop: 6 },
});
