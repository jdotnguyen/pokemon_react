import { Stack } from 'expo-router';
import { colors } from '../../../theme';

// Search keeps the system header on purpose: the native search bar it hosts is what lets the
// tab bar split Search off as its own glass button on iOS 26+. It's styled to match the other tabs.
export default function SearchLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: '#fff' },
        headerLargeTitleStyle: { fontSize: 32, fontWeight: '800', color: colors.ink },
        headerTintColor: colors.ink,
      }}
    />
  );
}
