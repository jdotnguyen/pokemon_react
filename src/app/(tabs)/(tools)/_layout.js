import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: 'tools' };

export default function ToolsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
