import { Stack } from 'expo-router';

// Header hidden so Search matches the other tabs (large in-page title, our own search field).
export default function SearchLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
