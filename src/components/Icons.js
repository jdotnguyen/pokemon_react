import Svg, { Circle, Line, Path } from 'react-native-svg';

/** Pokéball outline used as a background watermark. Opacity is applied to the whole SVG so overlaps don't stack. */
export function PokeballWatermark({ size = 120, color = '#fff', opacity = 0.18, style }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={[{ opacity }, style]} pointerEvents="none">
      <Circle cx="50" cy="50" r="43" stroke={color} strokeWidth="12" fill="none" />
      <Line x1="2" y1="50" x2="34" y2="50" stroke={color} strokeWidth="12" />
      <Line x1="66" y1="50" x2="98" y2="50" stroke={color} strokeWidth="12" />
      <Circle cx="50" cy="50" r="12" stroke={color} strokeWidth="9" fill="none" />
    </Svg>
  );
}

export function BackArrow({ size = 26, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 12H4M10 6l-6 6 6 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function Heart({ size = 24, color = '#fff', filled = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.8 3.6 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.4 0 5.5 3.3 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}

export function ChevronRight({ size = 18, color = '#9AA3AE' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 5l7 7-7 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
