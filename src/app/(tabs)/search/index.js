import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { usePokemonIndex } from '../../../api/pokeapi';
import { formatName } from '../../../lib/format';
import PokemonGrid from '../../../components/PokemonGrid';

// Search by name ("char") or number ("4", "#004").
function matches(item, query) {
  const q = query.trim().toLowerCase().replace(/^#/, '');
  if (!q) return true;
  if (/^\d+$/.test(q)) return String(item.id).startsWith(String(Number(q)));
  return item.name.includes(q.replace(/\s+/g, '-')) || formatName(item.name).toLowerCase().includes(q);
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { data, isPending, error, refetch } = usePokemonIndex();

  const results = useMemo(() => (data ?? []).filter((p) => matches(p, query)), [data, query]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <Stack.Title>Search</Stack.Title>
      <Stack.SearchBar
        placement="automatic"
        placeholder="Name or number"
        // Handles both a plain string and a native event payload.
        onChangeText={(e) => setQuery(typeof e === 'string' ? e : (e?.nativeEvent?.text ?? ''))}
      />
      <PokemonGrid
        data={results}
        header={<View style={styles.spacer} />}
        loading={isPending}
        error={error}
        onRetry={() => refetch()}
        emptyText={query ? `No Pokémon match “${query}”.` : undefined}
        keyboardDismissMode="on-drag"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  spacer: {
    height: 12,
  },
});
