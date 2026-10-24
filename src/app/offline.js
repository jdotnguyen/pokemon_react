import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HubBack from '../components/HubBack';
import ScreenTitle from '../components/ScreenTitle';
import { ACCENT } from '../components/detail/shared';
import {
  offlinePack,
  offlineSupported,
  pauseOffline,
  serviceWorkerReady,
  startOffline,
  useOfflineStatus,
} from '../lib/offline';

const formatBytes = (n) => (n >= 1024 ** 3 ? `${(n / 1024 ** 3).toFixed(2)} GB` : `${Math.round(n / 1024 ** 2)} MB`);

/** How much space this site uses on the device, refreshed while a download runs. */
function useStorageUsage(active) {
  const [usage, setUsage] = useState(null);
  useEffect(() => {
    if (!offlineSupported || !navigator.storage?.estimate) return undefined;
    let alive = true;
    const read = () =>
      navigator.storage
        .estimate()
        .then((e) => alive && setUsage(e.usage ?? null))
        .catch(() => {});
    read();
    const timer = active ? setInterval(read, 2500) : null;
    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, [active]);
  return usage;
}

export default function OfflineScreen() {
  const insets = useSafeAreaInsets();
  const status = useOfflineStatus();
  const pack = offlinePack.use();
  const [withMedia, setWithMedia] = useState(true);
  const running = status.state === 'running';
  const usage = useStorageUsage(running);
  const pct = status.total > 0 ? Math.min(100, Math.round((status.done / status.total) * 100)) : 0;

  const buttonLabel = running
    ? 'Pause'
    : status.state === 'paused'
      ? 'Resume'
      : pack.completedAt
        ? 'Check for missing data'
        : 'Download everything';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <HubBack fallback="/tools" />
        <ScreenTitle>Offline mode</ScreenTitle>

        {!offlineSupported ? (
          <Text style={styles.body}>Offline mode is part of the installed web app (add it to your home screen). It isn't available in this build.</Text>
        ) : (
          <>
            <Text style={styles.body}>
              Downloads every Pokémon, move, item and location so the app loads instantly and works with no connection.
              Use Wi-Fi and keep the app open: it takes a few minutes and a few hundred MB, more with artwork.
            </Text>

            <Pressable
              style={styles.row}
              onPress={() => !running && setWithMedia(!withMedia)}
              accessibilityRole="switch"
              accessibilityState={{ checked: withMedia, disabled: running }}
            >
              <View style={[styles.box, withMedia && styles.boxOn]}>{withMedia ? <Text style={styles.tick}>✓</Text> : null}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Include artwork, sprites and cries</Text>
                <Text style={styles.rowSub}>Bigger download. Without it, images still load from the network.</Text>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
              onPress={() => (running ? pauseOffline() : startOffline({ withMedia }))}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>{buttonLabel}</Text>
            </Pressable>

            {(running || status.state === 'paused' || status.state === 'done') && status.total > 0 ? (
              <View style={styles.card}>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.cardTitle}>
                  {status.state === 'done' ? 'All downloaded' : status.state === 'paused' ? 'Paused' : status.phase}
                </Text>
                <Text style={styles.cardSub}>
                  {status.done.toLocaleString()} of {status.total.toLocaleString()} ({pct}%)
                  {status.failed ? ` · ${status.failed} failed, run it again to retry` : ''}
                </Text>
              </View>
            ) : null}

            {status.message ? <Text style={styles.error}>{status.message}</Text> : null}
            {!serviceWorkerReady() && status.state === 'idle' ? (
              <Text style={styles.note}>
                Offline support starts after the app has been opened once from your home screen. If the button says it's still starting, close and reopen the app.
              </Text>
            ) : null}

            <View style={styles.facts}>
              {pack.completedAt ? (
                <Text style={styles.fact}>
                  Last full download: {new Date(pack.completedAt).toLocaleString()}
                  {pack.withMedia ? ' (with artwork)' : ' (data only)'}
                </Text>
              ) : null}
              {usage != null ? <Text style={styles.fact}>Stored on this device: {formatBytes(usage)}</Text> : null}
              <Text style={styles.fact}>
                Search filters by stats build their own table the first time you use them. Open Search once while online.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 15, maxWidth: 640, width: '100%', alignSelf: 'center' },
  body: { fontSize: 15, lineHeight: 22, color: '#4B5563', marginHorizontal: 5, marginBottom: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 5, marginBottom: 18 },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: '#C9D1D8', alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: ACCENT, borderColor: ACCENT },
  tick: { color: '#fff', fontWeight: '800', fontSize: 14, lineHeight: 16 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: '#1F2A37' },
  rowSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  button: { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginHorizontal: 5, marginBottom: 18 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  card: { backgroundColor: '#F4F5FB', borderRadius: 16, padding: 16, marginHorizontal: 5, marginBottom: 14 },
  track: { height: 8, borderRadius: 4, backgroundColor: '#DDE0F3', overflow: 'hidden', marginBottom: 12 },
  fill: { height: 8, borderRadius: 4, backgroundColor: ACCENT },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1F2A37' },
  cardSub: { fontSize: 13, color: '#6B7280', marginTop: 3 },
  error: { color: '#B42318', fontSize: 14, marginHorizontal: 5, marginBottom: 12 },
  note: { color: '#6B7280', fontSize: 13, marginHorizontal: 5, marginBottom: 12 },
  facts: { marginHorizontal: 5, gap: 6, marginTop: 4 },
  fact: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
});
