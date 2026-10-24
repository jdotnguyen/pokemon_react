import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackArrow } from '../Icons';
import PokemonRow from '../PokemonRow';
import { ACCENT, SectionTitle } from '../detail/shared';

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
  const goBack = () => (router.canGoBack() ? router.back() : router.replace(backFallback));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <FlatList
        data={rows}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        ListHeaderComponent={
          <View>
            <Pressable onPress={goBack} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
              <BackArrow color="#1F2A37" />
            </Pressable>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {loading ? (
              <ActivityIndicator style={styles.status} color={ACCENT} />
            ) : error ? (
              <Pressable onPress={onRetry} style={styles.status}>
                <Text style={styles.statusText}>Couldn't load this. Tap to retry.</Text>
              </Pressable>
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
  back: { alignSelf: 'flex-start', marginTop: 8, marginBottom: 16 },
  title: { fontSize: 30, fontWeight: '800', color: '#1F2A37' },
  subtitle: { fontSize: 15, color: '#8A94A1', marginTop: 2 },
  status: { marginTop: 40, alignItems: 'center' },
  statusText: { color: '#5B6573', fontSize: 15 },
});
