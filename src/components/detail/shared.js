import { StyleSheet, Text, View } from 'react-native';

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
