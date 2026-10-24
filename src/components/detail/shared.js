import { Pressable, StyleSheet, Text, View } from 'react-native';

export const ACCENT = '#6C79DB';

export function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function InfoRow({ label, children }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.value}>
        {typeof children === 'string' ? <Text style={styles.valueText}>{children}</Text> : children}
      </View>
    </View>
  );
}

/** Pill toggle. `color` is the active background (defaults to the accent). */
export function Chip({ label, active, onPress, color = ACCENT }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: color }]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Para({ children, style }) {
  return <Text style={[styles.para, style]}>{children}</Text>;
}

/** Row of big-number stat boxes: items = [{ label, value }]. */
export function StatBox({ items }) {
  return (
    <View style={styles.statBox}>
      {items.map((it) => (
        <View key={it.label} style={styles.statCell}>
          <Text style={styles.statCellValue}>{it.value ?? '—'}</Text>
          <Text style={styles.statCellLabel}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function EmptyState({ children }) {
  return <Text style={styles.empty}>{children}</Text>;
}

export const text = StyleSheet.create({
  value: {
    fontSize: 14,
    color: '#1F2A37',
  },
  muted: {
    fontSize: 14,
    color: '#8A94A1',
  },
});

const styles = StyleSheet.create({
  para: { fontSize: 14, lineHeight: 21, color: '#4B5563', marginTop: 12 },
  statBox: { flexDirection: 'row', backgroundColor: '#F6F7F9', borderRadius: 14, paddingVertical: 12, marginTop: 16 },
  statCell: { flex: 1, alignItems: 'center' },
  statCellValue: { fontSize: 16, fontWeight: '700', color: '#1F2A37' },
  statCellLabel: { fontSize: 11, color: '#8A94A1', marginTop: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F1F3F6',
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5B6573',
  },
  chipTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2A37',
    marginTop: 24,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    width: 100,
    fontSize: 14,
    color: '#8A94A1',
  },
  value: {
    flex: 1,
  },
  valueText: {
    fontSize: 14,
    color: '#1F2A37',
  },
  empty: {
    fontSize: 14,
    color: '#8A94A1',
    textAlign: 'center',
    marginTop: 24,
  },
});
