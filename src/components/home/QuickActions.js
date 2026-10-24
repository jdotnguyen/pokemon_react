import { ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

const ACTIONS = [
  { label: 'Search', to: '/search' },
  { label: 'Moves', to: '/moves' },
  { label: 'Team', to: '/team' },
  { label: 'Calculator', to: '/calc' },
  { label: 'Compare', to: '/compare' },
  { label: 'Types', to: '/types' },
];

export default function QuickActions() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.content}>
      {ACTIONS.map((a) => (
        <Pressable
          key={a.label}
          onPress={() => router.navigate(a.to)}
          style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Text style={styles.text}>{a.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0, marginHorizontal: -20 },
  content: { paddingHorizontal: 20, gap: 8 },
  pill: { borderRadius: 999, borderWidth: 1, borderColor: '#D5DAE0', paddingHorizontal: 16, paddingVertical: 9 },
  pressed: { backgroundColor: '#F1F3F6' },
  text: { fontSize: 14, fontWeight: '700', color: '#1F2A37' },
});
