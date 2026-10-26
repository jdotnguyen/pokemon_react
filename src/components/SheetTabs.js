import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

/**
 * Underlined text tabs used at the top of the white sheet on detail screens.
 * `spread` spaces them across the full width (Pokémon detail); otherwise they sit left-aligned.
 */
export default function SheetTabs({ tabs, value, onChange, spread = false }) {
  return (
    <View style={[styles.tabs, spread ? styles.spread : styles.packed]} accessibilityRole="tablist">
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, active && styles.textActive]}>{t.label}</Text>
            <View style={[styles.indicator, active && { backgroundColor: colors.accent }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E3E7EC',
  },
  spread: {
    justifyContent: 'space-between',
  },
  packed: {
    gap: 28,
  },
  tab: {
    paddingTop: 12,
  },
  text: {
    fontSize: 14,
    color: colors.faint,
    fontWeight: '500',
    paddingBottom: 12,
  },
  textActive: {
    color: colors.ink,
    fontWeight: '700',
  },
  indicator: {
    height: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
});
