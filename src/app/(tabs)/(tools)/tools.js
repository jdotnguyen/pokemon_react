import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HubCard from '../../../components/HubCard';
import ScreenTitle from '../../../components/ScreenTitle';

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}>
        <ScreenTitle>Tools</ScreenTitle>
        <HubCard title="Team matchups" subtitle="Shared weaknesses and coverage for up to 6" color="#6C79DB" onPress={() => router.push('/team')} />
        <HubCard title="Stat calculator" subtitle="Real stats from level, nature, IVs and EVs" color="#E0865A" onPress={() => router.push('/calc')} />
        <HubCard title="Daily challenge" subtitle="Five silhouettes, the same for everyone. Keep your streak" color="#F4A340" onPress={() => router.push('/daily')} />
        <HubCard title="Who's that Pokémon?" subtitle="Name the silhouette. Track your streak" color="#48D0B0" onPress={() => router.push('/quiz')} />
        <HubCard title="Compare" subtitle="Stats and type matchup, side by side" color="#F67FA1" onPress={() => router.push('/compare')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 15 },
});
