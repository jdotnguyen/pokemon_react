import { useLocalSearchParams } from 'expo-router';
import { useAbility } from '../../../../api/pokeapi';
import { cleanEffect, dexRows } from '../../../../lib/browse';
import { englishEntry, formatName } from '../../../../lib/format';
import { generationLabel } from '../../../../lib/regions';
import DetailList from '../../../../components/browse/DetailList';
import { Para } from '../../../../components/detail/shared';

export default function AbilityScreen() {
  const { name } = useLocalSearchParams();
  const { data, isPending, error, refetch } = useAbility(name);

  const title = englishEntry(data?.names, 'name') ?? formatName(name);
  const short = cleanEffect(englishEntry(data?.effect_entries, 'short_effect'));
  const long = cleanEffect(englishEntry(data?.effect_entries, 'effect'));
  const rows = dexRows(data?.pokemon, (e) => (e.is_hidden ? 'Hidden ability' : null));

  return (
    <DetailList
      title={title}
      subtitle={data?.generation ? `Introduced in ${generationLabel(data.generation.name)}` : undefined}
      loading={isPending}
      error={error}
      onRetry={refetch}
      rows={rows}
      rowsTitle="Pokémon with this ability"
    >
      {short ? <Para>{short}</Para> : null}
      {long && long !== short ? <Para>{long}</Para> : null}
    </DetailList>
  );
}
