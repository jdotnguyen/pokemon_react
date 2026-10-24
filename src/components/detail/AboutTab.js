import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import {
  englishEntry,
  formatHeight,
  formatName,
  formatPercent,
  formatWeight,
  genderRatio,
  heldItems,
  itemSpriteUrl,
  speciesLabel,
  titleCase,
} from '../../lib/format';
import { flavorEntries } from '../../lib/browse';
import { versionLabel } from '../../lib/regions';
import { Chip, InfoRow, SectionTitle, text } from './shared';

export default function AboutTab({ pokemon, species }) {
  const [pickedVersion, setPickedVersion] = useState(null);
  const entries = flavorEntries(species?.flavor_text_entries);
  const activeEntry = entries.find((e) => e.version === pickedVersion) ?? entries[entries.length - 1];

  const gender = genderRatio(species?.gender_rate);
  const held = heldItems(pokemon.held_items);
  const genus = speciesLabel(englishEntry(species?.genera, 'genus') ?? '');

  return (
    <View>
      {activeEntry ? <Text style={styles.description}>{activeEntry.text}</Text> : null}
      {entries.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.versions}>
          {entries.map((e) => (
            <Chip
              key={e.version}
              label={versionLabel(e.version)}
              active={e.version === activeEntry.version}
              onPress={() => setPickedVersion(e.version)}
            />
          ))}
        </ScrollView>
      )}

      <InfoRow label="Species">{genus || '—'}</InfoRow>
      <InfoRow label="Height">{formatHeight(pokemon.height)}</InfoRow>
      <InfoRow label="Weight">{formatWeight(pokemon.weight)}</InfoRow>
      <InfoRow label="Abilities">
        <View style={styles.abilities}>
          {pokemon.abilities.map((a) => (
            <Pressable
              key={a.ability.name}
              onPress={() => router.push(`/abilities/${a.ability.name}`)}
              hitSlop={6}
              accessibilityRole="link"
              accessibilityLabel={`${formatName(a.ability.name)} ability`}
            >
              <Text style={styles.ability}>
                {formatName(a.ability.name)}
                {a.is_hidden ? <Text style={text.muted}> (hidden)</Text> : null}
              </Text>
            </Pressable>
          ))}
        </View>
      </InfoRow>
      {held.length > 0 && (
        <InfoRow label="Held Items">
          <View>
            {held.map((h) => (
              <View key={h.name} style={styles.itemRow}>
                <Image source={{ uri: itemSpriteUrl(h.name) }} style={styles.itemIcon} contentFit="contain" />
                <Text style={text.value}>
                  {formatName(h.name)}
                  {h.rarity != null ? ` (${h.rarity}%)` : ''}
                </Text>
              </View>
            ))}
          </View>
        </InfoRow>
      )}

      <SectionTitle>Breeding</SectionTitle>
      <InfoRow label="Gender">
        {species == null ? (
          <Text style={text.muted}>—</Text>
        ) : gender ? (
          <View style={styles.genderRow}>
            <Text style={[styles.genderSymbol, { color: '#5B8DEF' }]}>♂</Text>
            <Text style={[text.value, styles.genderValue]}>{formatPercent(gender.male)}</Text>
            <Text style={[styles.genderSymbol, { color: '#F07AA9' }]}>♀</Text>
            <Text style={text.value}>{formatPercent(gender.female)}</Text>
          </View>
        ) : (
          <Text style={text.value}>Genderless</Text>
        )}
      </InfoRow>
      <InfoRow label="Egg Groups">
        {species ? species.egg_groups.map((g) => formatName(g.name)).join(', ') || '—' : '—'}
      </InfoRow>
      <InfoRow label="Egg Cycle">
        {species?.hatch_counter != null ? `${species.hatch_counter} cycles` : '—'}
      </InfoRow>

      <SectionTitle>Other</SectionTitle>
      <InfoRow label="Habitat">{species?.habitat ? titleCase(species.habitat.name) : '—'}</InfoRow>
      <InfoRow label="Color">{species?.color ? titleCase(species.color.name) : '—'}</InfoRow>
      <InfoRow label="Shape">{species?.shape ? titleCase(species.shape.name) : '—'}</InfoRow>
      <InfoRow label="Growth Rate">{species?.growth_rate ? titleCase(species.growth_rate.name) : '—'}</InfoRow>
      <InfoRow label="Catch Rate">{species?.capture_rate != null ? String(species.capture_rate) : '—'}</InfoRow>
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4B5563',
    marginBottom: 12,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderSymbol: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  versions: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 12,
  },
  abilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 4,
  },
  ability: {
    fontSize: 14,
    color: '#6C79DB',
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  itemIcon: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  genderValue: {
    marginRight: 20,
  },
});
