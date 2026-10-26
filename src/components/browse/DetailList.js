import { FlatList, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HubBack from '../HubBack';
import PageWatermark from '../PageWatermark';
import ScreenTitle from '../ScreenTitle';
import PokemonRow from '../PokemonRow';
import { SectionTitle, StatusMessage } from '../ui';
import { colors } from '../../theme';

/**
 * Detail screen for a game concept (ability, move, item...). `children` is the info block at the top;
 * `rows` ([{ id, name, note }]) is an optional virtualized list of Pokémon below it.
 */
export default function DetailList({
  title,
  subtitle,
  backFallback = '/explore',
  loading,
  error,
  onRetry,
  children,
  rows = [],
  rowsTitle,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <PageWatermark />
      <FlatList
        data={rows}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <HubBack fallback={backFallback} />
              <ScreenTitle style={subtitle ? styles.titleWithSub : null}>{title}</ScreenTitle>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {loading || error ? (
              <StatusMessage loading={loading} error={error} onRetry={onRetry} message="Couldn't load this." />
            ) : (
              <>
                {children}
                {rows.length > 0 && rowsTitle ? <SectionTitle>{`${rowsTitle} (${rows.length})`}</SectionTitle> : null}
              </>
            )}
          </View>
        }
        renderItem={({ item }) => <PokemonRow id={item.id} name={item.name} note={item.note} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 24 },
  header: { marginHorizontal: -5 }, // HubBack/ScreenTitle bring their own 5px inset
  titleWithSub: { marginBottom: 0 },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 2, marginHorizontal: 5, marginBottom: 8 },
});
