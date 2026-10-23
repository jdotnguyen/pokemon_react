import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokemonIndex } from '../../../api/pokeapi';
import { formatName } from '../../../lib/format';
import PokemonGrid, { GRID_GAP } from '../../../components/PokemonGrid';
import ScreenTitle from '../../../components/ScreenTitle';
import { ClearIcon, SearchIcon } from '../../../components/Icons';

// Search by name ("char") or number ("4", "#004").
function matches(item, query) {
  const q = query.trim().toLowerCase().replace(/^#/, '');
  if (!q) return true;
  if (/^\d+$/.test(q)) return String(item.id).startsWith(String(Number(q)));
  return item.name.includes(q.replace(/\s+/g, '-')) || formatName(item.name).toLowerCase().includes(q);
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const { data, isPending, error, refetch } = usePokemonIndex();

  const results = useMemo(() => (data ?? []).filter((p) => matches(p, query)), [data, query]);

  // Opening the tab with nothing typed puts the cursor straight in the field,
  // like the system search tab does.
  useFocusEffect(
    useCallback(() => {
      if (!query) {
        const t = setTimeout(() => inputRef.current?.focus(), 250);
        return () => clearTimeout(t);
      }
    }, [query])
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Pinned above the grid so the field never scrolls away. */}
      <View style={styles.header}>
        <ScreenTitle>Search</ScreenTitle>
        <View style={styles.field}>
          <SearchIcon />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Name or number"
            placeholderTextColor="#A0A8B3"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="never"
            returnKeyType="search"
            accessibilityLabel="Search Pokémon"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
              <ClearIcon />
            </Pressable>
          ) : null}
        </View>
      </View>

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
  header: {
    paddingHorizontal: 20 - GRID_GAP / 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: GRID_GAP / 2,
    marginTop: -6,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F1F3F6',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2A37',
    paddingVertical: 0,
  },
  spacer: {
    height: 14,
  },
});
