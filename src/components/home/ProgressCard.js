import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSeen } from '../../lib/seen';
import { useDaily } from './useDaily';

const SIZE = 84;
const STROKE = 9;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Ring showing how much of the Pokédex you've opened. */
export default function ProgressCard() {
  const { index } = useDaily();
  const seen = useSeen();
  const total = index?.length ?? 0;
  const count = seen.filter((id) => id < 10000).length;
  const fraction = total > 0 ? Math.min(count / total, 1) : 0;

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`You have viewed ${count} of ${total} Pokémon`}
    >
      <View style={styles.ring}>
        <Svg width={SIZE} height={SIZE}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke="#E3E6F7" strokeWidth={STROKE} fill="none" />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#6C79DB"
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE * fraction} ${CIRCUMFERENCE}`}
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <Text style={styles.percent}>{Math.round(fraction * 100)}%</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>
          {count} of {total || '…'} viewed
        </Text>
        <Text style={styles.sub}>
          {count === 0 ? 'Open a Pokémon to start your collection.' : 'Keep exploring to fill the ring.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#F6F7F9', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
  ring: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  percent: { position: 'absolute', fontSize: 16, fontWeight: '800', color: '#1F2A37' },
  text: { flex: 1 },
  title: { fontSize: 17, fontWeight: '800', color: '#1F2A37' },
  sub: { fontSize: 13, color: '#6B7480', marginTop: 3 },
});
