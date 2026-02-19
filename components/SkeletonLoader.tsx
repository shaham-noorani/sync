import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

type SkeletonLoaderProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
};

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className,
}: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const { isDark } = useTheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width: width as any,
        height,
        borderRadius,
        opacity,
        backgroundColor: isDark ? '#334155' : '#d1d5db',
      }}
      className={className}
    />
  );
}
