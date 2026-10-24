import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { ACCENT } from './shared';

/** Horizontal chips for switching between a species' forms (Alolan, Mega...). */
export default function FormsRow({ varieties, selectedId, onSelect }) {
  if (varieties.length < 2) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {varieties.map((v) => {
        const active = v.id === selectedId;
        return (
          <Pressable
            key={v.id}
            onPress={() => onSelect(v.id)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{v.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ScrollView defaults to flexShrink: 1, which lets the tab content squeeze it.
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F1F3F6',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: ACCENT,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5B6573',
  },
  labelActive: {
    color: '#fff',
  },
});
