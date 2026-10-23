import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEvolutionChain } from '../../api/pokeapi';
import { artworkUrl, evolutionPairs, formatName } from '../../lib/format';
import { ChevronRight, PokeballWatermark } from '../Icons';
import { ACCENT, EmptyState, SectionTitle } from './shared';

function Stage({ member, currentId }) {
  const isCurrent = member.id === currentId;
  return (
    <Pressable
      style={styles.stage}
      disabled={isCurrent}
      onPress={() => router.push(`/pokemon/${member.id}`)}
      accessibilityRole="button"
      accessibilityLabel={formatName(member.name)}
    >
      <View style={styles.artWrap}>
        <PokeballWatermark size={84} color="#1F2A37" opacity={0.05} style={styles.ball} />
        <Image source={{ uri: artworkUrl(member.id) }} style={styles.art} contentFit="contain" cachePolicy="memory-disk" />
      </View>
      <Text style={[styles.stageName, isCurrent && styles.current]}>{formatName(member.name)}</Text>
    </Pressable>
  );
}

export default function EvolutionTab({ pokemon, species }) {
  const chain = useEvolutionChain(species?.evolution_chain?.url);

  if (!species || chain.isPending) return <ActivityIndicator style={styles.loading} color={ACCENT} />;
  if (chain.error) return <EmptyState>Couldn't load the evolution chain.</EmptyState>;

  const pairs = evolutionPairs(chain.data.chain);
  if (pairs.length === 0) return <EmptyState>{formatName(pokemon.name)} does not evolve.</EmptyState>;

  return (
    <View>
      <SectionTitle>Evolution Chain</SectionTitle>
      {pairs.map((p, i) => (
        <View key={`${p.from.id}-${p.to.id}`} style={[styles.pair, i > 0 && styles.divider]}>
          <Stage member={p.from} currentId={pokemon.id} />
          <View style={styles.trigger}>
            <ChevronRight color="#B7BEC7" size={22} />
            <Text style={styles.triggerText}>{p.trigger}</Text>
          </View>
          <Stage member={p.to} currentId={pokemon.id} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: 24,
  },
  pair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E3E7EC',
  },
  stage: {
    alignItems: 'center',
    width: 110,
  },
  artWrap: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    position: 'absolute',
  },
  art: {
    width: 70,
    height: 70,
  },
  stageName: {
    marginTop: 6,
    fontSize: 14,
    color: '#1F2A37',
  },
  current: {
    fontWeight: '700',
  },
  trigger: {
    alignItems: 'center',
    flex: 1,
  },
  triggerText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2A37',
    textAlign: 'center',
  },
});
