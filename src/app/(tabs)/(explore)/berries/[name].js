import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useBerry, useItem } from '../../../../api/pokeapi';
import { berryFlavors, cleanEffect } from '../../../../lib/browse';
import { englishEntry, formatName, itemSpriteUrl } from '../../../../lib/format';
import { typeColor } from '../../../../lib/types';
import DetailList from '../../../../components/browse/DetailList';
import { Para, SectionTitle, StatBox } from '../../../../components/detail/shared';

const FLAVOR_MAX = 40; // potency bars clamp here

export default function BerryScreen() {
  const { name } = useLocalSearchParams();
  const { data, isPending, error, refetch } = useBerry(name);
  const item = useItem(`${name}-berry`);

  const effect =
    cleanEffect(englishEntry(item.data?.effect_entries, 'effect')) ??
    cleanEffect([...(item.data?.flavor_text_entries ?? [])].reverse().find((e) => e.language?.name === 'en')?.text);
  const flavors = berryFlavors(data);

  return (
    <DetailList
      title={`${formatName(name)} Berry`}
      subtitle={data ? `${formatName(data.firmness.name)} · ${data.size / 10} cm` : undefined}
      backFallback="/berries"
      loading={isPending}
      error={error}
      onRetry={refetch}
    >
      {data ? (
        <>
          <Image source={{ uri: itemSpriteUrl(`${name}-berry`) }} style={styles.sprite} contentFit="contain" />
          {effect ? <Para>{effect}</Para> : null}

          <SectionTitle>Growing</SectionTitle>
          <StatBox
            items={[
              { label: 'Per stage', value: `${data.growth_time}h` },
              { label: 'Max harvest', value: data.max_harvest },
              { label: 'Smoothness', value: data.smoothness },
              { label: 'Soil dryness', value: data.soil_dryness },
            ]}
          />

          <SectionTitle>Natural Gift</SectionTitle>
          <View style={styles.gift}>
            <View style={[styles.typeChip, { backgroundColor: typeColor(data.natural_gift_type.name) }]}>
              <Text style={styles.typeText}>{formatName(data.natural_gift_type.name)}</Text>
            </View>
            <Text style={styles.power}>{data.natural_gift_power} power</Text>
          </View>

          {flavors.length > 0 ? (
            <>
              <SectionTitle>Flavours</SectionTitle>
              {flavors.map((f) => (
                <View key={f.flavor} style={styles.flavorRow}>
                  <Text style={styles.flavorName}>{formatName(f.flavor)}</Text>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${Math.min(f.potency / FLAVOR_MAX, 1) * 100}%` }]} />
                  </View>
                  <Text style={styles.potency}>{f.potency}</Text>
                </View>
              ))}
            </>
          ) : null}
        </>
      ) : null}
    </DetailList>
  );
}

const styles = StyleSheet.create({
  sprite: { width: 72, height: 72, marginTop: 14 },
  gift: { flexDirection: 'row', alignItems: 'center' },
  typeChip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5, marginRight: 12 },
  typeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  power: { fontSize: 14, color: '#4B5563' },
  flavorRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  flavorName: { width: 70, fontSize: 14, color: '#8A94A1' },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#EEF1F4', overflow: 'hidden', marginHorizontal: 10 },
  fill: { height: '100%', borderRadius: 3, backgroundColor: '#6C79DB' },
  potency: { width: 28, fontSize: 14, fontWeight: '600', color: '#1F2A37', textAlign: 'right' },
});
