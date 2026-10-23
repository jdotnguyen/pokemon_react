import { StyleSheet, Text, View } from 'react-native';
import { formatName, levelUpMoves } from '../../lib/format';
import { EmptyState, SectionTitle } from './shared';

export default function MovesTab({ pokemon, color }) {
  const moves = levelUpMoves(pokemon.moves);

  if (moves.length === 0) return <EmptyState>No level-up moves recorded.</EmptyState>;

  return (
    <View>
      <SectionTitle>Learned by level up</SectionTitle>
      {moves.map((m) => (
        <View key={`${m.name}-${m.level}`} style={styles.row}>
          <View style={[styles.level, { backgroundColor: color }]}>
            <Text style={styles.levelText}>{m.level === 0 ? 'Evo' : `Lv. ${m.level}`}</Text>
          </View>
          <Text style={styles.name}>{formatName(m.name)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF1F4',
  },
  level: {
    width: 56,
    borderRadius: 999,
    paddingVertical: 4,
    alignItems: 'center',
    marginRight: 14,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    fontSize: 14,
    color: '#1F2A37',
  },
});
