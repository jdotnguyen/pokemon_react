import { StyleSheet, Text, View } from 'react-native';
import { formatName } from '../lib/format';

export default function TypeBadge({ type, size = 'small' }) {
  const large = size === 'large';
  return (
    <View style={[styles.badge, large && styles.badgeLarge]}>
      <Text style={[styles.text, large && styles.textLarge]}>{formatName(type)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 5,
  },
  badgeLarge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 0,
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  textLarge: {
    fontSize: 13,
  },
});
