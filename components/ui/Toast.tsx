import { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

type ToastProps = {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  type?: 'success' | 'error' | 'info';
};

const bgColors = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-dark-600',
};

export function Toast({
  message,
  visible,
  onHide,
  duration = 3000,
  type = 'info',
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        opacity,
        transform: [{ translateY }],
        zIndex: 1000,
      }}
      className={`${bgColors[type]} rounded-xl px-4 py-3`}
    >
      <Text className="text-white text-center font-medium">{message}</Text>
    </Animated.View>
  );
}
