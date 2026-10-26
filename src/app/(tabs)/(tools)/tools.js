import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HubCard from '../../../components/HubCard';
import HubBack from '../../../components/HubBack';
import PageWatermark from '../../../components/PageWatermark';
import ScreenTitle from '../../../components/ScreenTitle';
import { offlinePack, offlineSupported } from '../../../lib/offline';
import { colors } from '../../../theme';

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const pack = offlinePack.use();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <PageWatermark />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}>
        <HubBack to="/" />
        <ScreenTitle>Tools</ScreenTitle>
        <HubCard title="Team matchups" subtitle="Shared weaknesses and coverage for up to 6" color={colors.accent} onPress={() => router.push('/team')} />
        <HubCard title="Stat calculator" subtitle="Real stats from level, nature, IVs and EVs" color="#E0865A" onPress={() => router.push('/calc')} />
        <HubCard title="Daily challenge" subtitle="Five silhouettes, the same for everyone. Keep your streak" color="#F4A340" onPress={() => router.push('/daily')} />
        <HubCard title="Who's that Pokémon?" subtitle="Name the silhouette. Track your streak" color="#48D0B0" onPress={() => router.push('/quiz')} />
        <HubCard title="Compare" subtitle="Stats and type matchup, side by side" color="#F67FA1" onPress={() => router.push('/compare')} />
        {offlineSupported ? (
          <HubCard
            title="Offline mode"
            subtitle={pack.completedAt ? `Downloaded ${new Date(pack.completedAt).toLocaleDateString()}` : 'Download everything so it loads instantly with no connection'}
            color="#5B8DEF"
            onPress={() => router.push('/offline')}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 15 },
});
