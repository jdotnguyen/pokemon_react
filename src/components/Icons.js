import Svg, { Circle, Line, Path } from 'react-native-svg';
import { colors } from '../theme';

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

export function ChevronRight({ size = 18, color = colors.placeholder }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 5l7 7-7 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function Sparkle({ size = 22, color = '#fff', filled = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}

export function Speaker({ size = 22, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <Path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function Compare({ size = 24, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function TeamIcon({ size = 24, color = '#fff', filled = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="9" cy="8" r="3.2" stroke={color} strokeWidth="2" fill={filled ? color : 'none'} />
      <Path d="M3 19c0-3.2 2.7-5.2 6-5.2s6 2 6 5.2" stroke={color} strokeWidth="2" strokeLinecap="round" fill={filled ? color : 'none'} />
      <Path d="M17 8.5v5M14.5 11h5" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={filled ? 0 : 1} />
      <Path d="M16.5 11.2l1.6 1.6 3-3.2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={filled ? 1 : 0} />
    </Svg>
  );
}

export function Shuffle({ size = 22, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 7h3.2c1.4 0 2.7.7 3.5 1.8l4.6 6.4c.8 1.1 2.1 1.8 3.5 1.8H21M3 17h3.2c1.4 0 2.7-.7 3.5-1.8M14.3 8.8C15.1 7.7 16.4 7 17.8 7H21M18 4l3 3-3 3M18 14l3 3-3 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
