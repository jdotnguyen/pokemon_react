import { View } from 'react-native';

// Web version of Section: the same staggered fade-and-rise as native, done with a CSS animation
// instead of Reanimated. Reanimated only did this one thing on web and cost ~650 KB on the Home chunk.
const fadeInDown = [{ from: { opacity: 0, transform: [{ translateY: 24 }] }, to: { opacity: 1, transform: [{ translateY: 0 }] } }];

const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Fades and slides a Home section in, staggered by its position on the page. */
export default function Section({ index = 0, style, children }) {
  const animation = reduceMotion
    ? null
    : {
        animationKeyframes: fadeInDown,
        animationDuration: '380ms',
        animationDelay: `${index * 70}ms`,
        animationTimingFunction: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
        animationFillMode: 'both',
      };
  return <View style={[animation, style]}>{children}</View>;
}
