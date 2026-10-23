import { StyleSheet, Text, View } from 'react-native';
import {
  englishEntry,
  formatHeight,
  formatName,
  formatPercent,
  formatWeight,
  genderRatio,
  speciesLabel,
} from '../../lib/format';
import { InfoRow, SectionTitle, text } from './shared';

function latestFlavorText(entries = []) {
  const en = entries.filter((e) => e.language?.name === 'en');
  const last = en[en.length - 1];
  return last?.flavor_text.replace(/[\f\n\r­]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function AboutTab({ pokemon, species }) {
  const abilities = pokemon.abilities
    .map((a) => formatName(a.ability.name) + (a.is_hidden ? ' (hidden)' : ''))
    .join(', ');

  const gender = genderRatio(species?.gender_rate);
  const description = latestFlavorText(species?.flavor_text_entries);
  const genus = speciesLabel(englishEntry(species?.genera, 'genus') ?? '');

  return (
    <View>
      {description ? <Text style={styles.description}>{description}</Text> : null}

      <InfoRow label="Species">{genus || '—'}</InfoRow>
      <InfoRow label="Height">{formatHeight(pokemon.height)}</InfoRow>
      <InfoRow label="Weight">{formatWeight(pokemon.weight)}</InfoRow>
      <InfoRow label="Abilities">{abilities}</InfoRow>

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
  genderValue: {
    marginRight: 20,
  },
});
