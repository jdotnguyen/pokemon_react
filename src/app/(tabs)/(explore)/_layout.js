import { Stack } from 'expo-router';

// Explore is a hub (explore.js) with Types and Regions pushed on top, so the tab bar stays visible.
// URLs stay /types/... and /regions/... because "(explore)" is a route group.
export const unstable_settings = { initialRouteName: 'explore' };

export default function ExploreLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
