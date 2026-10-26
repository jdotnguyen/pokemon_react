import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

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
export function Chip({ label, active, onPress, color = colors.accent }) {
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

/**
 * Spinner while `loading`; a tap-to-retry message when `error` is set; nothing otherwise.
 * `message` is the first sentence ("Couldn't load this type.") and " Tap to retry." is added.
 * `style` / `textStyle` adjust spacing for screens that sit the message lower or tint it.
 */
export function StatusMessage({ loading, error, onRetry, message = "Couldn't reach PokeAPI.", style, textStyle }) {
  if (loading) return <ActivityIndicator style={[styles.status, style]} color={colors.accent} />;
  if (!error) return null;
  return (
    <Pressable onPress={onRetry} style={[styles.status, style]} accessibilityRole="button">
      <Text style={[styles.statusText, textStyle]}>{`${message} Tap to retry.`}</Text>
    </Pressable>
  );
}

export const text = StyleSheet.create({
  value: {
    fontSize: 14,
    color: colors.ink,
  },
  muted: {
    fontSize: 14,
    color: colors.muted,
  },
});

const styles = StyleSheet.create({
  status: { marginTop: 40, alignItems: 'center' },
  statusText: { color: colors.subtle, fontSize: 15 },
  para: { fontSize: 14, lineHeight: 21, color: colors.body, marginTop: 12 },
  statBox: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 14, paddingVertical: 12, marginTop: 16 },
  statCell: { flex: 1, alignItems: 'center' },
  statCellValue: { fontSize: 16, fontWeight: '700', color: colors.ink },
  statCellLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.fill,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.subtle,
  },
  chipTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
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
    color: colors.muted,
  },
  value: {
    flex: 1,
  },
  valueText: {
    fontSize: 14,
    color: colors.ink,
  },
  empty: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 24,
  },
});
