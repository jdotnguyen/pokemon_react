import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, PokeballWatermark } from './Icons';

/** Big coloured row used on the Explore and Tools hub screens. */
export default function HubCard({ title, subtitle, color, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: color }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <PokeballWatermark size={110} style={styles.ball} />
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <ChevronRight color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 22,
    marginHorizontal: 5,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  ball: {
    position: 'absolute',
    right: -20,
    bottom: -30,
  },
  text: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 3,
  },
});
