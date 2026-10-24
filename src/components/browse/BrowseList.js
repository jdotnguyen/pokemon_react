import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { filterByQuery } from '../../lib/browse';
import { ChevronRight } from '../Icons';
import HubBack from '../HubBack';
import ScreenTitle from '../ScreenTitle';
import { ACCENT } from '../detail/shared';

/**
 * Full-screen searchable list used by the Explore sections.
 * `items`: [{ key, label, sub?, right?, rightColor?, image?, search?, onPress? }]. Pass `renderRow` to
 * draw rows yourself, and `filter(item)` to layer extra filters (chips etc.) on top of the text search.
 */
export default function BrowseList({
  title,
  placeholder = 'Search',
  items,
  loading,
  error,
  onRetry,
  header,
  filter,
  renderRow,
  emptyText = 'Nothing matches.',
  windowSize = 11,
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const searched = filterByQuery(items ?? [], query);
    return filter ? searched.filter(filter) : searched;
  }, [items, query, filter]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <FlatList
        data={loading || error ? [] : data}
        keyExtractor={(item) => String(item.key)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        windowSize={windowSize}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        ListHeaderComponent={
          <View>
            <HubBack fallback="/explore" />
            <ScreenTitle>{title}</ScreenTitle>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder}
              placeholderTextColor="#9AA3AE"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              style={styles.input}
            />
            {header}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.status} color={ACCENT} />
          ) : error ? (
            <Pressable onPress={onRetry} style={styles.status}>
              <Text style={styles.statusText}>Couldn't reach PokeAPI. Tap to retry.</Text>
            </Pressable>
          ) : (
            <Text style={[styles.statusText, styles.status]}>{emptyText}</Text>
          )
        }
        renderItem={({ item }) =>
          renderRow ? (
            renderRow(item)
          ) : (
            <Pressable
              onPress={item.onPress}
              disabled={!item.onPress}
              style={({ pressed }) => [styles.row, pressed && item.onPress && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.thumb} contentFit="contain" cachePolicy="memory-disk" />
              ) : null}
              <View style={styles.text}>
                <Text style={styles.label}>{item.label}</Text>
                {item.sub ? <Text style={styles.sub}>{item.sub}</Text> : null}
              </View>
              {item.right ? (
                <View style={[styles.badge, item.rightColor && { backgroundColor: item.rightColor }]}>
                  <Text style={[styles.badgeText, !item.rightColor && styles.badgeTextPlain]}>{item.right}</Text>
                </View>
              ) : null}
              {item.onPress ? <ChevronRight /> : null}
            </Pressable>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 15 },
  input: {
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F3F6',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1F2A37',
    marginHorizontal: 5,
    marginBottom: 12,
  },
  status: { marginTop: 40, textAlign: 'center', alignSelf: 'center', paddingHorizontal: 24 },
  statusText: { color: '#5B6573', fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF1F4',
  },
  pressed: { opacity: 0.6 },
  thumb: { width: 36, height: 36, marginRight: 12 },
  text: { flex: 1, marginRight: 8 },
  label: { fontSize: 15, fontWeight: '600', color: '#1F2A37' },
  sub: { fontSize: 12, color: '#8A94A1', marginTop: 1 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginRight: 6, backgroundColor: '#F1F3F6' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  badgeTextPlain: { color: '#5B6573' },
});
