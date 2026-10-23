import { Stack } from 'expo-router';

// Region and location screens push inside this tab, so the tab bar stays visible while exploring.
export default function RegionsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
