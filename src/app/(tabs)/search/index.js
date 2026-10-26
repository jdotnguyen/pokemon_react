import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useGeneration, useGenerations, usePokemonIndex, useTypes } from '../../../api/pokeapi';
import { matchesQuery } from '../../../lib/search';
import { hasFlag, statOf, useStatIndex } from '../../../lib/statIndex';
import { dexPokemonOfType, intersectIds, speciesIdsOfGeneration } from '../../../lib/typeInfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackArrow } from '../../../components/Icons';
import HubBack from '../../../components/HubBack';
import PageWatermark from '../../../components/PageWatermark';
import ScreenTitle from '../../../components/ScreenTitle';
import PokemonGrid from '../../../components/PokemonGrid';
import SearchFilters from '../../../components/SearchFilters';
import StatFilters, { statLabel } from '../../../components/StatFilters';
import { colors } from '../../../theme';

// iOS/Android put the search field in the system header (and iOS 26 splits it into the tab bar).
// The web build has no native search bar, so it draws its own header with a text field instead.
const IS_WEB = Platform.OS === 'web';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const { data, isPending, error, refetch } = usePokemonIndex();

  // Filters: up to two types (dual-typed Pokémon) and one generation, combined with the text query.
  const [types, setTypes] = useState([]);
  const [generation, setGeneration] = useState(null);
  const typeQueries = useTypes(types);
  const generationQuery = useGeneration(generation);
  const generations = useGenerations().data ?? [];

  const filtering = types.length > 0 || generation != null;
  const filterLoading =
    typeQueries.some((q) => q.isPending) || (generation != null && generationQuery.isPending);
  const allowed = filtering && !filterLoading
    ? intersectIds([
        ...typeQueries.map((q) => dexPokemonOfType(q.data).map((p) => p.id)),
        ...(generation != null ? [speciesIdsOfGeneration(generationQuery.data)] : []),
      ])
    : null;

  // Sorting and stat filters need the saved stat table (downloaded once, on demand).
  const stats = useStatIndex();
  const [panelOpen, setPanelOpen] = useState(false);
  const [sort, setSort] = useState('number');
  const [cats, setCats] = useState([]);
  const [minStat, setMinStat] = useState(null);
  const sortsByStat = sort !== 'number' && sort !== 'name';
  const needsStats = sortsByStat || cats.length > 0 || minStat != null;
  const statsMissing = needsStats && !stats.rows;
  useEffect(() => {
    if (statsMissing && stats.state === 'idle') stats.load();
  }, [statsMissing, stats]);
  const statsPending = statsMissing && (stats.state === 'idle' || stats.state === 'loading');

  const results = useMemo(() => {
    if (filterLoading || statsMissing) return [];
    let list = (data ?? []).filter((p) => matchesQuery(p, query) && (!allowed || allowed.has(p.id)));
    const rows = stats.rows;
    if (rows && cats.length > 0) list = list.filter((p) => rows[p.id] && cats.some((c) => hasFlag(rows[p.id], c)));
    if (rows && minStat) list = list.filter((p) => rows[p.id] && statOf(rows[p.id], minStat.key) >= minStat.value);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (rows && sortsByStat) {
      list = list
        .filter((p) => rows[p.id])
        .map((p) => ({ ...p, value: statOf(rows[p.id], sort) }))
        .sort((a, b) => b.value - a.value || a.id - b.id)
        .map((p) => ({ ...p, badge: `${statLabel(sort)} ${p.value}` }));
    }
    return list;
  }, [data, query, allowed, filterLoading, statsMissing, stats.rows, cats, minStat, sort, sortsByStat]);

  const toggleType = (t) =>
    setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t].slice(-2)));
  const toggleCat = (c) => setCats((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));
  const extraActive = sort !== 'number' || cats.length > 0 || minStat != null;
  const clearFilters = () => {
    setTypes([]);
    setGeneration(null);
    setSort('number');
    setCats([]);
    setMinStat(null);
  };

  return (
    <>
      {/* On native the grid must stay the first child so the large title collapses as it scrolls. */}
      {IS_WEB ? <PageWatermark /> : null}
      <PokemonGrid
        data={results}
        header={
          <View>
          {IS_WEB ? (
            <View style={{ paddingTop: insets.top }}>
              <HubBack to="/" />
              <ScreenTitle>Search</ScreenTitle>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Name or number"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                returnKeyType="search"
                inputMode="search"
                enterKeyHint="search"
                accessibilityLabel="Search Pokémon by name or number"
                style={styles.input}
              />
            </View>
          ) : null}
          <SearchFilters
            extraActive={extraActive}
            types={types}
            onToggleType={toggleType}
            generations={generations}
            generation={generation}
            onSelectGeneration={setGeneration}
            onClear={clearFilters}
            count={filterLoading || statsPending ? null : results.length}
          />
          <StatFilters
            open={panelOpen}
            onToggleOpen={() => setPanelOpen((o) => !o)}
            index={stats}
            sort={sort}
            onSort={setSort}
            cats={cats}
            onToggleCat={toggleCat}
            minStat={minStat}
            onMinStat={setMinStat}
          />
          </View>
        }
        loading={isPending || filterLoading || statsPending}
        error={error}
        onRetry={() => refetch()}
        emptyText={
          statsMissing
            ? 'Stat data isn\'t available yet. Open “Sort & stats” for download options.'
            : query || filtering || extraActive
              ? 'No Pokémon match your search.'
              : undefined
        }
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic"
      />
      <Stack.Screen
        options={IS_WEB ? { title: 'Search', headerShown: false } : {
          title: 'Search',
          // Same back arrow as the other screens; the large title sits under it.
          headerLeft: () => (
            <Pressable onPress={() => router.navigate('/')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
              <BackArrow color={colors.ink} />
            </Pressable>
          ),
          headerLargeTitleEnabled: true,
          headerSearchBarOptions: {
            placement: 'automatic',
            placeholder: 'Name or number',
            autoCapitalize: 'none',
            // Handles both a plain string and a native event payload.
            onChangeText: (e) => setQuery(typeof e === 'string' ? e : (e?.nativeEvent?.text ?? '')),
          },
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // Matches the search field on the Explore lists.
  input: {
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.fill,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink,
    marginHorizontal: 5,
    marginBottom: 12,
  },
});
