import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HubCard from '../../../components/HubCard';
import ScreenTitle from '../../../components/ScreenTitle';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}>
        <ScreenTitle>Explore</ScreenTitle>
        <HubCard title="Types" subtitle="All 18 types and how they match up" color="#FB6C6C" onPress={() => router.push('/types')} />
        <HubCard title="Regions" subtitle="Regional Pokédexes and where to find things" color="#48D0B0" onPress={() => router.push('/regions')} />
        <HubCard title="Moves" subtitle="Search every move by type and category" color="#E0865A" onPress={() => router.push('/moves')} />
        <HubCard title="Abilities" subtitle="What they do and who has them" color="#6C79DB" onPress={() => router.push('/abilities')} />
        <HubCard title="Items" subtitle="Every item, with held-by and effects" color="#D9A92E" onPress={() => router.push('/items')} />
        <HubCard title="Berries" subtitle="Growing, flavours and Natural Gift" color="#9CC24B" onPress={() => router.push('/berries')} />
        <HubCard title="TMs & HMs" subtitle="Which move each one teaches" color="#77BDFE" onPress={() => router.push('/tms')} />
        <HubCard title="Natures" subtitle="Which stats each nature raises and lowers" color="#F67FA1" onPress={() => router.push('/natures')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 15 },
});
