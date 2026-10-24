import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatName } from '../lib/format';
import { generationLabel } from '../lib/regions';
import { ALL_TYPES, typeColor } from '../lib/types';
import { Chip } from './detail/shared';
import { GRID_GAP } from './PokemonGrid';

const genChipLabel = (slug) => generationLabel(slug).replace('Generation ', 'Gen ');

/** Type (up to two) and generation filters shown above the search results. */
export default function SearchFilters({ types, onToggleType, generations, generation, onSelectGeneration, onClear, count, extraActive }) {
  const filtering = types.length > 0 || generation != null || !!extraActive;
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {ALL_TYPES.map((t) => (
          <Chip key={t} label={formatName(t)} color={typeColor(t)} active={types.includes(t)} onPress={() => onToggleType(t)} />
        ))}
      </ScrollView>

      {generations.length > 0 && (
        <>
          <Text style={styles.label}>Generation</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {generations.map((g) => (
              <Chip
                key={g}
                label={genChipLabel(g)}
                active={generation === g}
                onPress={() => onSelectGeneration(generation === g ? null : g)}
              />
            ))}
          </ScrollView>
        </>
      )}

      {filtering && (
        <View style={styles.summary}>
          <Text style={styles.count}>{count == null ? 'Filtering…' : `${count} result${count === 1 ? '' : 's'}`}</Text>
          <Text onPress={onClear} style={styles.clear} accessibilityRole="button">
            Clear filters
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: GRID_GAP / 2,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A94A1',
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 6,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 10,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  count: {
    fontSize: 13,
    color: '#5B6573',
  },
  clear: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C79DB',
  },
});
