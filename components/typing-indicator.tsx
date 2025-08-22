import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

export const TypingIndicator = () => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounceAnimation = (
      animValue: Animated.Value,
      delay: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: -8,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation1 = createBounceAnimation(dot1Anim, 0);
    const animation2 = createBounceAnimation(dot2Anim, 150);
    const animation3 = createBounceAnimation(dot3Anim, 300);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [dot1Anim, dot2Anim, dot3Anim]);

  return (
    <View className="flex-row space-x-1 py-1">
      <Animated.View
        className="w-2 h-2 bg-gray-400 rounded-full"
        style={{
          transform: [{ translateY: dot1Anim }],
        }}
      />
      <Animated.View
        className="w-2 h-2 bg-gray-400 rounded-full"
        style={{
          transform: [{ translateY: dot2Anim }],
        }}
      />
      <Animated.View
        className="w-2 h-2 bg-gray-400 rounded-full"
        style={{
          transform: [{ translateY: dot3Anim }],
        }}
      />
    </View>
  );
};
