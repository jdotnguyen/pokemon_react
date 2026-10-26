import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { BackArrow } from './Icons';

/**
 * Back arrow. Goes back when there's history, otherwise to `fallback` (e.g. after opening a deep link).
 * `to` always navigates there instead (tab roots → Home).
 */
export default function BackButton({ fallback = '/', to, color = '#fff', style }) {
  const onPress = () => {
    if (to) router.navigate(to);
    else if (router.canGoBack()) router.back();
    else router.replace(fallback);
  };
  return (
    <Pressable onPress={onPress} hitSlop={12} style={style} accessibilityRole="button" accessibilityLabel="Back">
      <BackArrow color={color} />
    </Pressable>
  );
}
