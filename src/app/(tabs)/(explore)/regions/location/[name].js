import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocation, useLocationAreas, usePokemon } from '../../../../../api/pokeapi';
import { englishEntry, formatName } from '../../../../../lib/format';
import { areaLabel, levelRange, summarizeEncounters, versionLabel } from '../../../../../lib/regions';
import { primaryColor } from '../../../../../lib/types';
import { ChevronRight } from '../../../../../components/Icons';
import HubBack from '../../../../../components/HubBack';
import PageWatermark from '../../../../../components/PageWatermark';
import ScreenTitle from '../../../../../components/ScreenTitle';
import { EmptyState, SectionTitle, StatusMessage } from '../../../../../components/ui';
import { colors } from '../../../../../theme';
import { artworkUrl } from '../../../../../lib/sprites';

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

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <PageWatermark />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}>
        <View style={styles.header}>
          <HubBack fallback="/regions" />
          <ScreenTitle style={regionName ? styles.titleWithSub : null}>{title}</ScreenTitle>
          {regionName ? <Text style={styles.subtitle}>{formatName(regionName)}</Text> : null}
        </View>

        {location.error || areasLoading ? (
          // The error wins: once the location fails, its area queries never start and stay pending.
          <StatusMessage
            loading={!location.error && areasLoading}
            error={location.error}
            onRetry={() => location.refetch()}
            message="Couldn't load this location."
          />
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
  header: { marginHorizontal: -5 }, // HubBack/ScreenTitle bring their own 5px inset
  titleWithSub: { marginBottom: 0 },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 2, marginHorizontal: 5, marginBottom: 8 },
  spacer: {
    height: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
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
    color: colors.ink,
  },
  rowDetails: {
    fontSize: 13,
    color: colors.body,
    marginTop: 2,
  },
  rowVersions: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  chance: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginHorizontal: 8,
  },
});
