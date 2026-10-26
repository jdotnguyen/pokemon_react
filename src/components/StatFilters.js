import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { STAT_LABELS } from '../lib/format';
import { GRID_GAP } from './PokemonGrid';
import { Chip } from './ui';
import { colors } from '../theme';

export const SORTS = [
  { key: 'number', label: 'Number' },
  { key: 'name', label: 'Name' },
  { key: 'total', label: 'Total' },
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'Attack' },
  { key: 'defense', label: 'Defense' },
  { key: 'special-attack', label: 'Sp. Atk' },
  { key: 'special-defense', label: 'Sp. Def' },
  { key: 'speed', label: 'Speed' },
];

export const CATEGORIES = [
  { key: 'legendary', label: 'Legendary' },
  { key: 'mythical', label: 'Mythical' },
  { key: 'baby', label: 'Baby' },
];

export const statLabel = (key) => (key === 'total' ? 'Total' : (STAT_LABELS[key] ?? key));
const THRESHOLDS = { total: [300, 400, 500, 600], other: [50, 70, 90, 110, 130] };
const MIN_STATS = SORTS.filter((s) => s.key !== 'number' && s.key !== 'name');

/** Collapsible "Sort & stats" panel for the search screen. Needs the saved stat index. */
export default function StatFilters({ open, onToggleOpen, index, sort, onSort, cats, onToggleCat, minStat, onMinStat }) {
  const active = sort !== 'number' || cats.length > 0 || minStat != null;

  // Opening the panel starts the quick download if we have no stats yet.
  useEffect(() => {
    if (open && index.state === 'idle') index.load();
  }, [open, index]);

  const pickMinStat = (key) => onMinStat(minStat?.key === key ? null : { key, value: key === 'total' ? 500 : 90 });
  const thresholds = minStat ? (minStat.key === 'total' ? THRESHOLDS.total : THRESHOLDS.other) : [];

  return (
    <View style={styles.wrap}>
      <Pressable onPress={onToggleOpen} style={styles.toggle} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Text style={styles.toggleText}>
          Sort & stats {open ? '▴' : '▾'}
          {active ? '  · on' : ''}
        </Text>
      </Pressable>

      {open && (
        <View>
          {index.state === 'loading' && (
            <View style={styles.status}>
              <ActivityIndicator color={colors.accent} size="small" />
              <Text style={styles.statusText}>
                Downloading stats{index.progress > 0 ? ` (${Math.round(index.progress * 100)}%)` : ''}. This is saved for next time.
              </Text>
            </View>
          )}
          {index.state === 'quick-failed' && (
            <View style={styles.status}>
              <View style={styles.statusCol}>
                <Text style={styles.statusText}>The quick download isn't available right now.</Text>
                <Text style={styles.link} onPress={index.loadFull} accessibilityRole="button">
                  Download full data instead (about 20 MB, one time)
                </Text>
              </View>
            </View>
          )}
          {index.state === 'failed' && (
            <View style={styles.status}>
              <View style={styles.statusCol}>
                <Text style={styles.statusText}>Couldn't download stats. Check your connection.</Text>
                <Text style={styles.link} onPress={index.loadFull} accessibilityRole="button">
                  Try again
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.label}>Sort by</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {SORTS.map((s) => (
              <Chip key={s.key} label={s.label} active={sort === s.key} onPress={() => onSort(s.key)} />
            ))}
          </ScrollView>

          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {CATEGORIES.map((c) => (
              <Chip key={c.key} label={c.label} active={cats.includes(c.key)} onPress={() => onToggleCat(c.key)} />
            ))}
          </ScrollView>

          <Text style={styles.label}>Minimum stat</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {MIN_STATS.map((s) => (
              <Chip key={s.key} label={s.label} active={minStat?.key === s.key} onPress={() => pickMinStat(s.key)} />
            ))}
          </ScrollView>
          {minStat && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
              {thresholds.map((t) => (
                <Chip
                  key={t}
                  label={`${statLabel(minStat.key)} ≥ ${t}`}
                  active={minStat.value === t}
                  onPress={() => onMinStat({ key: minStat.key, value: t })}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: GRID_GAP / 2, marginBottom: 10 },
  toggle: { alignSelf: 'flex-start', paddingVertical: 6 },
  toggleText: { fontSize: 14, fontWeight: '700', color: colors.accent },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', marginTop: 4, marginBottom: 6 },
  scroll: { flexGrow: 0, flexShrink: 0, marginBottom: 10 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 10 },
  statusCol: { flex: 1 },
  statusText: { flex: 1, fontSize: 13, color: colors.subtle },
  link: { fontSize: 13, fontWeight: '700', color: colors.accent, marginTop: 6 },
});
