import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Pressable,
  Text,
  Image,
  useWindowDimensions,
  Animated,
} from "react-native";
import { useGameStore } from "../../store/gameStore";
import { InspirationSpark } from "../game/InspirationSpark";
import { BonusWordTarget } from "../game/BonusWordTarget";

type Particle = {
  id: string;
  value: number;
  x: number;
  y: number;
};

const LocParticle: React.FC<{
  particle: Particle;
  onRemove: (id: string) => void;
}> = ({ particle, onRemove }) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -48,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onRemove(particle.id);
    });
  }, [opacity, translateY, onRemove, particle.id]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: `${particle.x}%`,
        bottom: `${particle.y}%`,
        width: 0,
        alignItems: "center",
      }}
    >
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <Text
          style={{
            color: "#7fff9a",
            fontWeight: "bold",
            fontSize: 15,
            textShadowColor: "rgba(0,0,0,0.8)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }}
        >
          +{particle.value} LoC
        </Text>
      </Animated.View>
    </View>
  );
};

export const GraphicGamePanel: React.FC = () => {
  const tapProgrammer = useGameStore((s) => s.tapProgrammer);
  const activeSparks = useGameStore((s) => s.activeSparks);
  const tapPower = useGameStore((s) => s.tapPower);
  const comboCount = useGameStore((s) => s.comboCount ?? 0);
  const isBurnedOut = useGameStore((s) => s.isBurnedOut);

  const { width } = useWindowDimensions();
  const tapSize = Math.min(480, Math.floor(width * 0.65));

  const [particles, setParticles] = useState<Particle[]>([]);
  const [borderFlash, setBorderFlash] = useState(false);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const removeParticle = useCallback((id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleTap = () => {
    tapProgrammer();

    setBorderFlash(true);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => {
      setBorderFlash(false);
      flashTimerRef.current = null;
    }, 100);

    if (!isBurnedOut) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const x = 38 + Math.random() * 24;
      const y = 36 + Math.random() * 12;
      setParticles((prev) => [...prev, { id, value: tapPower, x, y }]);
    }
  };

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const baseBorderColor = isBurnedOut ? "#cc2222" : "#444";
  const borderColor = borderFlash ? "#ffffff" : baseBorderColor;

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0d0d0d",
        padding: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Text
        style={{
          color: "#ffffff",
          fontSize: 24,
          fontWeight: "bold",
          letterSpacing: 4,
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        SIMULATION
      </Text>
      <Text
        style={{
          color: "#a0a0a0",
          marginBottom: 32,
          textAlign: "center",
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        Interactive Visual Node
      </Text>

      <Pressable
        onPress={handleTap}
        style={({ pressed }) => ({
          width: tapSize,
          height: tapSize,
          maxWidth: 480,
          maxHeight: 480,
          backgroundColor: "#1a1a1a",
          borderRadius: 12,
          borderWidth: 1,
          borderColor,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          transform: [{ scale: pressed ? 0.96 : 1.0 }],
        })}
      >
        <Image
          source={require("../../assets/images/programmer.png")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            resizeMode: "cover",
            opacity: 0.8,
          }}
        />

        {comboCount > 0 && (
          <Text
            style={{
              position: "absolute",
              alignSelf: "center",
              top: "18%",
              fontSize: Math.min(120, tapSize * 0.38),
              fontWeight: "900",
              color: "rgba(255,255,255,0.12)",
              zIndex: 1,
            }}
          >
            {comboCount}
          </Text>
        )}

        {particles.map((p) => (
          <LocParticle key={p.id} particle={p} onRemove={removeParticle} />
        ))}

        {isBurnedOut && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(80,0,0,0.45)",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 15,
            }}
          >
            <Text
              style={{
                color: "#ff4444",
                fontWeight: "bold",
                fontSize: 28,
                letterSpacing: 6,
                textTransform: "uppercase",
                textShadowColor: "rgba(0,0,0,0.9)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            >
              BURNOUT
            </Text>
          </View>
        )}

        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: "row",
            borderRadius: 6,
            alignItems: "center",
            marginTop: "auto",
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#555",
            position: "relative",
            zIndex: 10,
          }}
        >
          <Text
            style={{
              color: "#ffffff",
              fontWeight: "bold",
              letterSpacing: 2,
              fontSize: 12,
            }}
          >
            TAP TO EXECUTE
          </Text>
        </View>
      </Pressable>

      {activeSparks.map((spark) => (
        <InspirationSpark key={spark.id} spark={spark} />
      ))}

      <BonusWordTarget />
    </View>
  );
};
