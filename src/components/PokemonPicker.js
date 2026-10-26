import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokemonIndex } from '../api/pokeapi';
import { formatName, padId } from '../lib/format';
import { colors } from '../theme';
import { artworkUrl } from '../lib/sprites';
import { matchesQuery } from '../lib/search';
import { StatusMessage } from './ui';

const MAX_RESULTS = 80;

/** Full-screen sheet for choosing a Pokémon by name or number. */
export default function PokemonPicker({ visible, onClose, onPick }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const { data, isPending, error, refetch } = usePokemonIndex();

  const results = useMemo(
    () => (data ?? []).filter((p) => matchesQuery(p, query)).slice(0, MAX_RESULTS),
    [data, query]
  );

  const pick = (id) => {
    setQuery('');
    onPick(id);
  };
  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
        <View style={styles.top}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Name or number"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            style={styles.input}
          />
          <Pressable onPress={close} hitSlop={10} accessibilityRole="button">
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>

        {isPending || error ? (
          <StatusMessage loading={isPending} error={error} onRetry={() => refetch()} message="Couldn't load the Pokédex." style={styles.center} textStyle={styles.muted} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(p) => String(p.id)}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ListEmptyComponent={<Text style={[styles.muted, styles.center]}>No Pokémon match “{query}”.</Text>}
            renderItem={({ item }) => (
              <Pressable onPress={() => pick(item.id)} style={styles.row}>
                <Image source={{ uri: artworkUrl(item.id) }} style={styles.thumb} contentFit="contain" cachePolicy="memory-disk" />
                <Text style={styles.name}>{formatName(item.name)}</Text>
                <Text style={styles.number}>{padId(item.id)}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  top: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.fill,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink,
  },
  cancel: { color: colors.accent, fontSize: 16, fontWeight: '600', marginLeft: 14 },
  center: { marginTop: 40, textAlign: 'center', alignSelf: 'center' },
  muted: { color: colors.muted, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 6 },
  thumb: { width: 48, height: 48, marginRight: 14 },
  name: { flex: 1, fontSize: 16, color: colors.ink, fontWeight: '600' },
  number: { fontSize: 14, color: colors.muted },
});
