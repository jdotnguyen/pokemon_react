import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { usePokemonList, useTypes } from '../../api/pokeapi';
import { formatName } from '../../lib/format';
import { MAX_TEAM, sharedWeaknesses, teamDefense, useActiveTeamName, useTeam } from '../../lib/team';
import { typeColor } from '../../lib/types';
import { ChevronRight } from '../Icons';
import { colors } from '../../theme';
import { artworkUrl } from '../../lib/sprites';

/** Your active team on Home: sprites plus its biggest shared weaknesses. */
export default function TeamStrip() {
  const team = useTeam();
  const name = useActiveTeamName();

  const members = usePokemonList(team);
  const memberTypes = members.map((q) => q.data?.types.map((t) => t.type.name));
  const typeNames = [...new Set(memberTypes.flatMap((t) => t ?? []))];
  const typeQueries = useTypes(typeNames);
  const ready = team.length > 0 && memberTypes.every(Boolean) && typeQueries.every((q) => q.data);

  let weaknesses = [];
  if (ready) {
    const typeMap = Object.fromEntries(typeNames.map((n, i) => [n, typeQueries[i].data]));
    weaknesses = sharedWeaknesses(teamDefense(memberTypes, typeMap)).slice(0, 3);
  }

  return (
    <Pressable
      onPress={() => router.push('/team')}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${name}, edit team`}
    >
      <View style={styles.head}>
        <Text style={styles.title}>{name}</Text>
        <ChevronRight />
      </View>
      <View style={styles.slots}>
        {Array.from({ length: MAX_TEAM }, (_, i) => (
          <View key={i} style={[styles.slot, team[i] == null && styles.slotEmpty]}>
            {team[i] != null ? (
              <Image source={{ uri: artworkUrl(team[i]) }} style={styles.art} contentFit="contain" cachePolicy="memory-disk" />
            ) : null}
          </View>
        ))}
      </View>
      {team.length === 0 ? (
        <Text style={styles.note}>Build a team of up to 6 and see its weaknesses and coverage.</Text>
      ) : ready ? (
        weaknesses.length > 0 ? (
          <View style={styles.chips}>
            <Text style={styles.note}>Watch out:</Text>
            {weaknesses.map((w) => (
              <View key={w.type} style={[styles.chip, { backgroundColor: typeColor(w.type) }]}>
                <Text style={styles.chipText}>
                  {formatName(w.type)} · {w.weak} weak
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.note}>No shared weaknesses. Nicely balanced.</Text>
        )
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 16 },
  pressed: { opacity: 0.8 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '800', color: colors.ink },
  slots: { flexDirection: 'row', gap: 6 },
  slot: { flex: 1, aspectRatio: 1, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  slotEmpty: { backgroundColor: 'transparent', borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border },
  art: { width: '90%', height: '90%' },
  note: { fontSize: 13, color: '#6B7480', marginTop: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 12 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  chipText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
