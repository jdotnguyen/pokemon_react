import Animated, { FadeInDown } from 'react-native-reanimated';

/** Fades and slides a Home section in, staggered by its position on the page. */
export default function Section({ index = 0, style, children }) {
  return (
    <Animated.View entering={FadeInDown.duration(380).delay(index * 70)} style={style}>
      {children}
    </Animated.View>
  );
}
