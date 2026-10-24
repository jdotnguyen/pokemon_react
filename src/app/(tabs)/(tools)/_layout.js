import { Stack } from 'expo-router';

export const unstable_settings = { anchor: 'tools' };

export default function ToolsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
