import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { usePokemon, useSpecies } from '../api/pokeapi';
import { englishEntry, formatName, padId, speciesLabel } from '../lib/format';
import { randomItem } from '../lib/daily';
import { primaryColor } from '../lib/types';
import { PokeballWatermark, Shuffle } from './Icons';
import TypeBadge from './TypeBadge';
import { useDaily } from './home/useDaily';
import { colors } from '../theme';
import { pickArtwork } from '../lib/sprites';

/** Home hero: today's Pokémon in a big type-coloured card, with a button for a random one. */
export default function DailyPokemon() {
  const { index, pick } = useDaily();
  const { data } = usePokemon(pick?.id ?? null);
  const { data: species } = useSpecies(pick?.id ?? null);
  const types = data?.types.map((t) => t.type.name) ?? [];
  const genus = speciesLabel(englishEntry(species?.genera, 'genus') ?? '');

  if (!pick) return <View style={[styles.card, styles.placeholder]} />;

  const surprise = () => {
    const p = randomItem(index);
    if (p) router.push(`/pokemon/${p.id}`);
  };

  return (
    <Pressable
      onPress={() => router.push(`/pokemon/${pick.id}`)}
      style={({ pressed }) => [styles.card, { backgroundColor: primaryColor(types) }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Pokémon of the day: ${formatName(pick.name)}`}
    >
      <PokeballWatermark size={240} opacity={0.16} style={styles.ball} />
      <View style={styles.text}>
        <Text style={styles.kicker}>Pokémon of the day</Text>
        <Text style={styles.name} numberOfLines={1}>
          {formatName(pick.name)}
        </Text>
        <Text style={styles.sub}>
          {padId(pick.id)}
          {genus ? ` · ${genus}` : ''}
        </Text>
        <View style={styles.types}>
          {types.map((t) => (
            <TypeBadge key={t} type={t} size="large" />
          ))}
        </View>
      </View>
      <Image
        source={{ uri: pickArtwork(data, pick.id) }}
        style={styles.art}
        contentFit="contain"
        transition={200}
        cachePolicy="memory-disk"
      />
      <Pressable
        onPress={surprise}
        hitSlop={8}
        style={({ pressed }) => [styles.random, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Show a random Pokémon"
      >
        <Shuffle size={20} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, padding: 20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', minHeight: 200 },
  placeholder: { backgroundColor: colors.divider },
  pressed: { opacity: 0.85 },
  ball: { position: 'absolute', right: -50, top: -40 },
  text: { flex: 1, zIndex: 1, alignSelf: 'flex-start' },
  kicker: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  name: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 6 },
  sub: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', marginTop: 2, marginBottom: 14 },
  types: { flexDirection: 'row' },
  art: { width: 150, height: 150, position: 'absolute', right: 8, bottom: 8 },
  random: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
