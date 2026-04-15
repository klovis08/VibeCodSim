import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { useGameStore } from "../../store/gameStore";
import { USE_NATIVE_ANIM_DRIVER } from "../../utils/animatedNativeDriver";

export const ProgressToast: React.FC = () => {
  const notification = useGameStore((s) => s.activeNotification);
  const dismissNotification = useGameStore((s) => s.dismissNotification);
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!notification) return;

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: USE_NATIVE_ANIM_DRIVER,
        friction: 7,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: USE_NATIVE_ANIM_DRIVER,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 120,
          duration: 240,
          useNativeDriver: USE_NATIVE_ANIM_DRIVER,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: USE_NATIVE_ANIM_DRIVER,
        }),
      ]).start(() => dismissNotification());
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification, dismissNotification, opacity, translateY]);

  if (!notification) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 18,
        left: 20,
        right: 20,
        zIndex: 998,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View
        style={{
          backgroundColor: "#11161f",
          borderWidth: 1,
          borderColor: "#5f7fbd",
          borderRadius: 10,
          padding: 14,
        }}
      >
        <Text
          style={{
            color: "#bcd0ff",
            fontWeight: "700",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            fontFamily: "monospace",
          }}
        >
          {notification.title}
        </Text>
        <Text style={{ color: "#d4d4d4", marginTop: 3, fontSize: 12, fontFamily: "monospace" }}>
          {notification.message}
        </Text>
      </View>
    </Animated.View>
  );
};
