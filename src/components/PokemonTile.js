import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { usePokemon } from '../api/pokeapi';
import { formatName, padId } from '../lib/format';
import { primaryColor } from '../lib/types';
import { toggleFavourite, useIsFavourite } from '../lib/favourites';
import { Heart, PokeballWatermark } from './Icons';
import TypeBadge from './TypeBadge';
import { artworkUrl } from '../lib/sprites';

export const TILE_HEIGHT = 112;

// `badge` replaces the number with a short label (e.g. a stat when sorting).
// `number` overrides the displayed number (e.g. a regional Pokédex entry); defaults to the National Dex id.
function PokemonTile({ id, name: listName, number, badge }) {
  // Only tiles that are actually rendered (on screen + a small buffer) fetch their details.
  const { data } = usePokemon(id);
  const types = data?.types.map((t) => t.type.name) ?? [];
  const name = listName ?? data?.name ?? '';
  const isFavourite = useIsFavourite(id);

  return (
    <Pressable
      onPress={() => router.push(`/pokemon/${id}`)}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: primaryColor(types) },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${formatName(name)}, number ${id}`}
    >
      <PokeballWatermark size={96} style={styles.watermark} />
      <Text style={styles.number}>{badge ?? padId(number ?? id)}</Text>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {formatName(name)}
        </Text>
        {types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </View>

      <Image
        source={{ uri: artworkUrl(id) }}
        recyclingKey={String(id)}
        style={styles.image}
        contentFit="contain"
        transition={150}
        cachePolicy="memory-disk"
      />

      {/* Nested Pressable: handles its own tap, so it doesn't open the detail page */}
      <Pressable
        onPress={() => toggleFavourite(id)}
        hitSlop={10}
        style={styles.heart}
        accessibilityRole="button"
        accessibilityLabel={isFavourite ? `Remove ${formatName(name)} from favourites` : `Add ${formatName(name)} to favourites`}
      >
        <Heart size={18} filled={isFavourite} />
      </Pressable>
    </Pressable>
  );
}

export default memo(PokemonTile);

const styles = StyleSheet.create({
  tile: {
    height: TILE_HEIGHT,
    borderRadius: 16,
    padding: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  watermark: {
    position: 'absolute',
    right: -14,
    bottom: -14,
  },
  number: {
    position: 'absolute',
    top: 8,
    right: 12,
    fontSize: 16,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.12)',
  },
  info: {
    flex: 1,
    zIndex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
    marginRight: 28,
  },
  heart: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    zIndex: 2,
  },
  image: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 74,
    height: 74,
  },
});
