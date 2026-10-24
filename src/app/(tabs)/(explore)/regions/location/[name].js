import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocation, useLocationAreas, usePokemon } from '../../../../../api/pokeapi';
import { artworkUrl, englishEntry, formatName } from '../../../../../lib/format';
import { areaLabel, levelRange, summarizeEncounters, versionLabel } from '../../../../../lib/regions';
import { primaryColor } from '../../../../../lib/types';
import { BackArrow, ChevronRight } from '../../../../../components/Icons';
import { ACCENT, EmptyState, SectionTitle } from '../../../../../components/detail/shared';

function EncounterRow({ row }) {
  // Cached from the Pokédex tiles where possible; only used for the colour.
  const { data } = usePokemon(row.id);
  const color = primaryColor(data?.types.map((t) => t.type.name));
  const details = [levelRange(row.minLevel, row.maxLevel), row.methods.map(formatName).join(', ')]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={() => router.push(`/pokemon/${row.id}`)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={formatName(row.name)}
    >
      <View style={[styles.avatar, { backgroundColor: color }]}>
        <Image source={{ uri: artworkUrl(row.id) }} style={styles.avatarImage} contentFit="contain" cachePolicy="memory-disk" />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{formatName(row.name)}</Text>
        {details ? <Text style={styles.rowDetails}>{details}</Text> : null}
        <Text style={styles.rowVersions} numberOfLines={1}>
          {row.versions.map(versionLabel).join(', ')}
        </Text>
      </View>
      {row.chance ? <Text style={styles.chance}>{row.chance}%</Text> : null}
      <ChevronRight />
    </Pressable>
  );
}

export default function LocationScreen() {
  const { name } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const location = useLocation(name);
  const areaQueries = useLocationAreas(location.data?.areas.map((a) => a.url) ?? []);

  const title = englishEntry(location.data?.names, 'name') ?? formatName(name);
  const regionName = location.data?.region?.name;
  const areasLoading = location.isPending || areaQueries.some((q) => q.isPending);
  const areas = areaQueries
    .map((q) => q.data)
    .filter(Boolean)
    .map((area) => ({ name: area.name, rows: summarizeEncounters(area) }))
    .filter((a) => a.rows.length > 0);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/regions'));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}>
        <Pressable onPress={goBack} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
          <BackArrow color="#1F2A37" />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        {regionName ? <Text style={styles.subtitle}>{formatName(regionName)}</Text> : null}

        {location.error ? (
          <Pressable onPress={() => location.refetch()} style={styles.loading}>
            <Text style={styles.errorText}>Couldn't load this location. Tap to retry.</Text>
          </Pressable>
        ) : areasLoading ? (
          <ActivityIndicator style={styles.loading} color={ACCENT} />
        ) : areas.length === 0 ? (
          <EmptyState>No wild Pokémon are recorded here.</EmptyState>
        ) : (
          areas.map((area) => (
            <View key={area.name}>
              {areas.length > 1 || areaLabel(area.name, name) !== 'Main area' ? (
                <SectionTitle>{areaLabel(area.name, name)}</SectionTitle>
              ) : (
                <View style={styles.spacer} />
              )}
              {area.rows.map((row) => (
                <EncounterRow key={`${area.name}-${row.id}`} row={row} />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 24,
  },
  back: {
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1F2A37',
  },
  subtitle: {
    fontSize: 15,
    color: '#8A94A1',
    marginTop: 2,
  },
  spacer: {
    height: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF1F4',
  },
  rowPressed: {
    opacity: 0.5,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImage: {
    width: 44,
    height: 44,
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2A37',
  },
  rowDetails: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  rowVersions: {
    fontSize: 12,
    color: '#8A94A1',
    marginTop: 2,
  },
  chance: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2A37',
    marginHorizontal: 8,
  },
  loading: {
    marginTop: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#5B6573',
    fontSize: 15,
  },
});
