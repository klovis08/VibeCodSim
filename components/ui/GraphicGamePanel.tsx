import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Pressable, Text, Image, useWindowDimensions, Animated } from "react-native";
import { useGameStore } from "../../store/gameStore";
import { InspirationSpark } from "../game/InspirationSpark";
import { BonusWordTarget } from "../game/BonusWordTarget";
import { formatNumber } from "../../utils/formatNumber";
import { T } from "../../constants/theme";

type Particle = { id: string; value: number; x: number; y: number; color: string };

const LocParticle: React.FC<{ particle: Particle; onRemove: (id: string) => void }> = ({ particle, onRemove }) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1.2)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: T.motion.slow * 1.5, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -56, duration: T.motion.slow * 1.5, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.7, duration: T.motion.slow * 1.5, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) onRemove(particle.id); });
  }, [opacity, translateY, scale, onRemove, particle.id]);

  return (
    <View pointerEvents="none" style={{ position: "absolute", left: `${particle.x}%`, bottom: `${particle.y}%`, width: 0, alignItems: "center" }}>
      <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
        <Text style={{
          color: particle.color, fontWeight: "bold", fontSize: 15, fontFamily: T.mono,
          textShadowColor: "rgba(0,0,0,0.9)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
        }}>
          +{Math.round(particle.value)}
        </Text>
      </Animated.View>
    </View>
  );
};

const CORNER_SIZE = 20;
const CORNER_THICK = 2;
const CORNER_COLOR = `${T.accent.blue}66`;

const CornerBrackets: React.FC = () => (
  <>
    {/* Top-left */}
    <View pointerEvents="none" style={{ position: "absolute", top: 6, left: 6, zIndex: 5 }}>
      <View style={{ width: CORNER_SIZE, height: CORNER_THICK, backgroundColor: CORNER_COLOR }} />
      <View style={{ width: CORNER_THICK, height: CORNER_SIZE, backgroundColor: CORNER_COLOR }} />
    </View>
    {/* Top-right */}
    <View pointerEvents="none" style={{ position: "absolute", top: 6, right: 6, zIndex: 5, alignItems: "flex-end" }}>
      <View style={{ width: CORNER_SIZE, height: CORNER_THICK, backgroundColor: CORNER_COLOR }} />
      <View style={{ width: CORNER_THICK, height: CORNER_SIZE, backgroundColor: CORNER_COLOR, alignSelf: "flex-end" }} />
    </View>
    {/* Bottom-left */}
    <View pointerEvents="none" style={{ position: "absolute", bottom: 6, left: 6, zIndex: 5, justifyContent: "flex-end" }}>
      <View style={{ width: CORNER_THICK, height: CORNER_SIZE, backgroundColor: CORNER_COLOR }} />
      <View style={{ width: CORNER_SIZE, height: CORNER_THICK, backgroundColor: CORNER_COLOR }} />
    </View>
    {/* Bottom-right */}
    <View pointerEvents="none" style={{ position: "absolute", bottom: 6, right: 6, zIndex: 5, alignItems: "flex-end", justifyContent: "flex-end" }}>
      <View style={{ width: CORNER_THICK, height: CORNER_SIZE, backgroundColor: CORNER_COLOR, alignSelf: "flex-end" }} />
      <View style={{ width: CORNER_SIZE, height: CORNER_THICK, backgroundColor: CORNER_COLOR }} />
    </View>
  </>
);

const PulsingCTA: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const pulseAnim = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={{
        backgroundColor: "rgba(0,0,0,0.55)",
        paddingHorizontal: T.space.lg,
        paddingVertical: T.space.xs + 2,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: `${T.accent.blue}44`,
        opacity: pulseAnim,
      }}>
        <Text 
          selectable={false}
          style={{ color: T.accent.blue, fontWeight: "bold", letterSpacing: 3, fontSize: T.font.xs, fontFamily: T.mono, userSelect: "none" as any }}>
          TAP TO EXECUTE
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export const GraphicGamePanel: React.FC = () => {
  const tapProgrammer = useGameStore((s) => s.tapProgrammer);
  const activeSparks = useGameStore((s) => s.activeSparks);
  const tapPower = useGameStore((s) => s.tapPower);
  const comboCount = useGameStore((s) => s.comboCount ?? 0);
  const isBurnedOut = useGameStore((s) => s.isBurnedOut);
  const strainLevel = useGameStore((s) => s.strainLevel);
  const locPerSecond = useGameStore((s) => s.locPerSecond);

  const { width } = useWindowDimensions();
  const tapSize = Math.min(480, Math.floor(width * 0.65));

  const [particles, setParticles] = useState<Particle[]>([]);
  const [borderFlash, setBorderFlash] = useState(false);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const comboScale = useRef(new Animated.Value(1)).current;
  const prevCombo = useRef(comboCount);

  useEffect(() => {
    if (comboCount > prevCombo.current && comboCount > 0) {
      Animated.sequence([
        Animated.spring(comboScale, { toValue: 1.15, friction: 3, tension: 200, useNativeDriver: true }),
        Animated.spring(comboScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      ]).start();
    }
    prevCombo.current = comboCount;
  }, [comboCount, comboScale]);

  const removeParticle = useCallback((id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleTap = () => {
    tapProgrammer();
    setBorderFlash(true);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => { setBorderFlash(false); flashTimerRef.current = null; }, T.motion.fast);
    if (!isBurnedOut) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const x = 35 + Math.random() * 30;
      const y = 34 + Math.random() * 14;
      const color = Math.random() > 0.5 ? T.accent.green : T.accent.blueAlt;
      setParticles((prev) => [...prev, { id, value: tapPower, x, y, color }]);
    }
  };

  useEffect(() => () => { if (flashTimerRef.current) clearTimeout(flashTimerRef.current); }, []);

  const borderColor = borderFlash ? T.accent.blue : isBurnedOut ? T.accent.red : T.border.focus;
  const comboMult = (1 + comboCount * 0.01).toFixed(1);

  const strainColor = isBurnedOut ? T.accent.red : strainLevel > 80 ? T.accent.red : strainLevel > 50 ? T.accent.yellow : T.accent.green;

  const scanlines = isBurnedOut ? Array.from({ length: 12 }).map((_, i) => (
    <View key={i} pointerEvents="none" style={{
      position: "absolute", left: 0, right: 0,
      top: `${(i + 1) * 8}%`, height: 1,
      backgroundColor: "rgba(255,0,0,0.12)",
    }} />
  )) : null;

  return (
    <View
      style={{
        flex: 1, width: "100%",
        justifyContent: "center", alignItems: "center",
        backgroundColor: T.bg.base,
        position: "relative", overflow: "hidden",
      }}
      accessibilityLabel="Simulation panel"
    >
      {/* ── TOP HUD BAR ────────────────────────────────────── */}
      <View style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "rgba(0,0,0,0.65)",
        paddingHorizontal: T.space.lg, paddingVertical: T.space.sm,
        borderBottomWidth: 1, borderColor: `${T.accent.blue}20`,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: T.space.xs }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.accent.green }} />
          <Text style={{ color: T.accent.green, fontSize: T.font.sm, fontFamily: T.mono, fontWeight: "bold" }}>
            {formatNumber(locPerSecond)}/s
          </Text>
        </View>

        <View style={{ flex: 1, marginHorizontal: T.space.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: T.space.xs }}>
            <Text style={{ color: strainColor, fontSize: 9, fontFamily: T.mono, fontWeight: "bold", textTransform: "uppercase" }}>
              {isBurnedOut ? "BURNOUT" : `STR ${Math.round(strainLevel)}%`}
            </Text>
          </View>
          <View style={{
            height: 4, borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.08)", marginTop: 2,
            overflow: "hidden",
          }}>
            <View style={{
              width: `${Math.min(100, Math.round(strainLevel))}%`,
              height: "100%", borderRadius: 2,
              backgroundColor: strainColor,
              opacity: isBurnedOut ? 1 : 0.8,
            }} />
          </View>
        </View>

        <Text style={{ color: T.accent.blueAlt, fontSize: T.font.sm, fontFamily: T.mono, fontWeight: "bold" }}>
          +{Math.round(tapPower)} tap
        </Text>
      </View>

      {/* ── MAIN TAP AREA ──────────────────────────────────── */}
      <Pressable
        onPress={handleTap}
        accessibilityLabel="Tap to generate code"
        accessibilityRole="button"
        style={({ pressed }) => ({
          width: tapSize, height: tapSize, maxWidth: 480, maxHeight: 480,
          backgroundColor: T.bg.elevated,
          borderRadius: T.radius.lg,
          borderWidth: 2, borderColor,
          alignItems: "center", justifyContent: "center",
          overflow: "hidden", position: "relative",
          transform: [{ scale: pressed ? 0.96 : 1.0 }],
        })}
      >
        {/* Strain bar at very top of tap area */}
        <View pointerEvents="none" style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 4, zIndex: 6,
          backgroundColor: "rgba(0,0,0,0.3)",
        }}>
          <View style={{
            width: `${Math.min(100, Math.round(strainLevel))}%`,
            height: "100%",
            backgroundColor: strainColor,
          }} />
        </View>

        <Image
          source={require("../../assets/images/programmer.png")}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", resizeMode: "cover", opacity: 0.75 }}
        />

        <CornerBrackets />

        {particles.map((p) => (
          <LocParticle key={p.id} particle={p} onRemove={removeParticle} />
        ))}

        {scanlines}

        {isBurnedOut && (
          <View
            pointerEvents="none"
            accessibilityLiveRegion="polite"
            style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(80,0,0,0.5)",
              alignItems: "center", justifyContent: "center", zIndex: 15,
            }}
          >
            <Text style={{
              color: T.accent.red, fontWeight: "900", fontSize: 32,
              letterSpacing: 8, textTransform: "uppercase", fontFamily: T.mono,
              textShadowColor: "rgba(0,0,0,0.9)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
            }}>
              BURNOUT
            </Text>
          </View>
        )}
      </Pressable>

      {/* ── BOTTOM HUD BAR ─────────────────────────────────── */}
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "rgba(0,0,0,0.65)",
        paddingHorizontal: T.space.lg, paddingVertical: T.space.sm,
        borderTopWidth: 1, borderColor: `${T.accent.blue}20`,
      }}>
        {comboCount > 0 ? (
          <Animated.View style={{ flexDirection: "row", alignItems: "baseline", gap: T.space.xs, transform: [{ scale: comboScale }] }}>
            <Text style={{ color: "#fff", fontSize: T.font.xl, fontWeight: "900", fontFamily: T.mono }}>
              {comboCount}
            </Text>
            <Text style={{ color: `${T.accent.green}cc`, fontSize: T.font.sm, fontWeight: "bold", fontFamily: T.mono }}>
              x{comboMult}
            </Text>
          </Animated.View>
        ) : (
          <View />
        )}

        <PulsingCTA onPress={handleTap} />
      </View>

      {activeSparks.map((spark) => (
        <InspirationSpark key={spark.id} spark={spark} />
      ))}
      <BonusWordTarget />
    </View>
  );
};
