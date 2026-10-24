import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTypes } from '../../api/pokeapi';
import { dailyIndex } from '../../lib/daily';
import { formatName } from '../../lib/format';
import { countDexPokemon, typeMatchups } from '../../lib/typeInfo';
import { ALL_TYPES, typeColor } from '../../lib/types';
import { ChevronRight, PokeballWatermark } from '../Icons';
import { useDaily } from './useDaily';

/** A different type each day, with how many Pokémon share it and what it hits hardest. */
export default function TypeOfDay() {
  const { today } = useDaily();
  const type = ALL_TYPES[dailyIndex(`${today}-type`, ALL_TYPES.length)];
  const [query] = useTypes([type]);

  const count = query.data ? countDexPokemon(query.data) : null;
  const strongAgainst = typeMatchups(query.data)?.attacking[0].types ?? [];

  return (
    <Pressable
      onPress={() => router.push(`/types/${type}`)}
      style={({ pressed }) => [styles.card, { backgroundColor: typeColor(type) }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Type of the day: ${formatName(type)}`}
    >
      <PokeballWatermark size={130} style={styles.ball} />
      <View style={styles.text}>
        <Text style={styles.kicker}>Type of the day</Text>
        <Text style={styles.name}>{formatName(type)}</Text>
        <Text style={styles.sub}>
          {count != null ? `${count} Pokémon` : ' '}
          {strongAgainst.length > 0 ? ` · Strong against ${strongAgainst.map(formatName).join(', ')}` : ''}
        </Text>
      </View>
      <ChevronRight color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  pressed: { opacity: 0.85 },
  ball: { position: 'absolute', right: -24, top: -30 },
  text: { flex: 1, marginRight: 8, zIndex: 1 },
  kicker: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  name: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 2 },
  sub: { color: 'rgba(255,255,255,0.95)', fontSize: 12, fontWeight: '600', marginTop: 3, lineHeight: 17 },
});
