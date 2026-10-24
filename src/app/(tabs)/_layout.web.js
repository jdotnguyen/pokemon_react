import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ACCENT } from '../../components/detail/shared';

// Web version of the tab bar: a floating, frosted-glass capsule at the bottom, like the iOS one.
// (Native keeps the system tab bar in _layout.js.) It sits in the page flow under the screen,
// so content never hides behind it.

const MUTED = '#6B7280';

function Icon({ name, color }) {
  const common = { stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      {name === 'home' && <Path {...common} d="M3 11.5 12 4l9 7.5M5.5 10v10h4.5v-6h4v6h4.5V10" />}
      {name === 'heart' && (
        <Path {...common} d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.8 3.6 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.4 0 5.5 3.3 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z" />
      )}
      {name === 'explore' && (
        <>
          <Circle {...common} cx="12" cy="12" r="9" />
          <Path {...common} d="m15.8 8.2-2.1 5.5-5.5 2.1 2.1-5.5z" />
        </>
      )}
      {name === 'tools' && (
        <Path {...common} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      )}
      {name === 'search' && (
        <>
          <Circle {...common} cx="11" cy="11" r="7" />
          <Path {...common} d="m16.5 16.5 4 4" />
        </>
      )}
    </Svg>
  );
}

const ITEMS = {
  index: { label: 'Home', icon: 'home' },
  favourites: { label: 'Favourites', icon: 'heart' },
  '(explore)': { label: 'Explore', icon: 'explore' },
  '(tools)': { label: 'Tools', icon: 'tools' },
  search: { label: 'Search', icon: 'search' },
};

function FloatingTabBar({ state, emitter, navigateToTab, insets }) {
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets?.bottom ?? 0, 10) }]}>
      <View style={styles.bar} role="tablist">
        {state.routes.map((route, index) => {
          const item = ITEMS[route.name];
          if (!item) return null;
          const focused = state.index === index;
          const color = focused ? ACCENT : MUTED;
          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              role="tab"
              aria-selected={focused}
              aria-label={item.label}
              style={[styles.tab, focused && styles.tabActive]}
            >
              <Icon name={item.icon} color={color} />
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="favourites" />
      <Tabs.Screen name="(explore)" />
      <Tabs.Screen name="(tools)" />
      <Tabs.Screen name="search" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 6, paddingHorizontal: 12 },
  bar: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 520,
    padding: 5,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
    // Frosted glass; ignored by browsers without backdrop-filter.
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    boxShadow: '0 8px 28px rgba(20, 24, 60, 0.16), 0 1px 3px rgba(20, 24, 60, 0.08)',
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 7, paddingHorizontal: 2, borderRadius: 29, cursor: 'pointer' },
  tabActive: { backgroundColor: 'rgba(108,121,219,0.14)' },
  label: { fontSize: 10.5, fontWeight: '600' },
});
