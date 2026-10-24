import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePokemon, useSpecies } from '../../api/pokeapi';
import { dailyIndex } from '../../lib/daily';
import { factsFor } from '../../lib/facts';
import { useDaily } from './useDaily';

/** One "Did you know?" line about today's Pokémon, different each day. */
export default function FactCard() {
  const { pick, today } = useDaily();
  const pokemon = usePokemon(pick?.id ?? null);
  const species = useSpecies(pick?.id ?? null);

  const fact = useMemo(() => {
    if (!pokemon.data || !species.data) return null;
    const facts = factsFor(pokemon.data, species.data);
    return facts.length ? facts[dailyIndex(`${today}-fact`, facts.length)] : null;
  }, [pokemon.data, species.data, today]);

  if (!fact) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Did you know?</Text>
      <Text style={styles.text}>{fact}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#EEF0FD', borderRadius: 18, padding: 16 },
  kicker: { fontSize: 12, fontWeight: '800', color: '#6C79DB', textTransform: 'uppercase', letterSpacing: 0.6 },
  text: { fontSize: 15, lineHeight: 22, color: '#1F2A37', marginTop: 6 },
});
