import React, { useState, useEffect } from "react";
import {
  Platform,
  Pressable,
  useWindowDimensions,
  View,
  Text,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useGameStore, getEnergyTechCost, ACHIEVEMENT_DEFINITIONS } from "../store/gameStore";

import { TokenDisplay } from "../components/game/TokenDisplay";
import { UpgradeCard } from "../components/game/UpgradeCard";
import { RebootButton } from "../components/game/RebootButton";
import { MetaTreePanel } from "../components/game/MetaTreePanel";
import { MilestonePanel } from "../components/game/MilestonePanel";
import { GraphicGamePanel } from "../components/ui/GraphicGamePanel";
import { WelcomeBackToast } from "../components/ui/WelcomeBackToast";
import { ProgressToast } from "../components/ui/ProgressToast";
import { NeonText } from "../components/ui/NeonText";
import { Battery, Settings } from "lucide-react-native";
import { formatNumber } from "../utils/formatNumber";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MobileTab = "NODE" | "PACKAGES" | "ADVANCED" | "BOOST" | "PROGRESS";
type DesktopSubTab = "packages" | "advanced" | "boost" | "progress";

const SUB_TAB_LABELS: { key: DesktopSubTab; label: string }[] = [
  { key: "packages", label: "Packages" },
  { key: "advanced", label: "Advanced" },
  { key: "boost", label: "Boost" },
  { key: "progress", label: "Progress" },
];

const MOBILE_TABS: { key: MobileTab; label: string }[] = [
  { key: "NODE", label: "Node" },
  { key: "PACKAGES", label: "Pkgs" },
  { key: "ADVANCED", label: "Adv" },
  { key: "BOOST", label: "Boost" },
  { key: "PROGRESS", label: "Prog" },
];

const SubTabBar = ({
  active,
  onSelect,
  tabs,
}: {
  active: string;
  onSelect: (key: string) => void;
  tabs: { key: string; label: string }[];
}) => (
  <View
    style={{
      flexDirection: "row",
      borderBottomWidth: 1,
      borderColor: "#1e1e1e",
      backgroundColor: "#0c0c0c",
    }}
  >
    {tabs.map((t) => {
      const isActive = active === t.key;
      return (
        <Pressable
          key={t.key}
          onPress={() => onSelect(t.key)}
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: "center",
            borderBottomWidth: 2,
            borderBottomColor: isActive ? "#007acc" : "transparent",
            backgroundColor: isActive ? "#1a1a1a" : "transparent",
          }}
        >
          <Text
            style={{
              color: isActive ? "#00D4FF" : "#888",
              fontSize: 11,
              fontWeight: isActive ? "700" : "500",
              textTransform: "uppercase",
              letterSpacing: 1,
              fontFamily: "monospace",
            }}
          >
            {t.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const SECTION_HEADER = {
  paddingHorizontal: 16,
  color: "#858585",
  textTransform: "uppercase" as const,
  fontSize: 11,
  fontWeight: "bold" as const,
  marginBottom: 8,
  marginTop: 12,
  letterSpacing: 1.5,
};

const PackagesContent: React.FC = () => (
  <ScrollView style={{ flex: 1, paddingTop: 4 }}>
    <Text style={SECTION_HEADER}>General Packages</Text>
    <UpgradeCard
      type="autoCoder"
      title="Auto-Coder Unit"
      description="+0.30 passive LoC/sec and +0.50 tap power per level"
    />
    <UpgradeCard
      type="server"
      title="Dedicated AWS Node"
      description="+0.50 passive LoC/sec per level"
    />
    <UpgradeCard
      type="keyboard"
      title="Mechanical Switch"
      description="+0.18 passive LoC/sec and +0.08 tap power per level"
    />
  </ScrollView>
);

const AdvancedContent: React.FC = () => (
  <ScrollView style={{ flex: 1, paddingTop: 4 }}>
    <Text style={SECTION_HEADER}>Advanced Modules</Text>
    <UpgradeCard
      type="aiPair"
      title="AI Pair Programmer"
      unlocksAt={500}
      description="-15% strain per level"
    />
    <UpgradeCard
      type="gitAutopilot"
      title="Git Autopilot"
      unlocksAt={5000}
      description="+10% passive LoC/sec per level"
    />
    <UpgradeCard
      type="cloudBurst"
      title="Cloud Burst"
      unlocksAt={50000}
      description="2x income for 30s (costs 1 can)"
    />

    <Text style={{ ...SECTION_HEADER, marginTop: 16 }}>Scale Modules</Text>
    <UpgradeCard
      type="ciPipeline"
      title="CI Pipeline"
      description="+20% passive layer per level"
    />
    <UpgradeCard
      type="observability"
      title="Observability Matrix"
      description="+35% global layer per level"
    />
  </ScrollView>
);

const BoostContent: React.FC = () => {
  const energyDrinks = useGameStore((s) => s.energyDrinks);
  const techLevel = useGameStore((s) => s.energyTechLevel);
  const prestigeLevel = useGameStore((s) => s.rebootPrestigeLevel);
  const rebootCount = useGameStore((s) => s.rebootCount);
  const purchaseEnergyUpgrade = useGameStore((s) => s.purchaseEnergyUpgrade);
  const cost = getEnergyTechCost(techLevel);
  const canAfford = energyDrinks >= cost;
  const isMaxed = techLevel >= 20;

  const shopBonus = (techLevel * 0.2 * (1 / (1 + techLevel * 0.05)) * 100).toFixed(0);
  const rebootBonus = (prestigeLevel * 0.15 * (1 / (1 + prestigeLevel * 0.03)) * 100).toFixed(0);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <View
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#333",
            backgroundColor: "#1a1a1a",
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
          >
            <View
              style={{
                backgroundColor: "#111",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <Battery
                size={24}
                color={canAfford ? "#39FF14" : "#858585"}
                strokeWidth={1.5}
              />
            </View>
            <View>
              <Text
                style={{
                  color: "#d4d4d4",
                  fontWeight: "500",
                  fontSize: 16,
                }}
              >
                Overclock Engine
              </Text>
              <Text
                style={{
                  color: "#858585",
                  fontSize: 13,
                  marginTop: 4,
                  fontFamily: "monospace",
                }}
              >
                Lv.{techLevel} (+{shopBonus}% shop / +{rebootBonus}% prestige)
              </Text>
            </View>
          </View>
          <Pressable
            onPress={purchaseEnergyUpgrade}
            disabled={!canAfford || isMaxed}
            style={{
              borderRadius: 4,
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: isMaxed
                ? "#1a1a00"
                : canAfford
                ? "#1b5e20"
                : "#333",
            }}
          >
            <Text
              style={{
                fontFamily: "monospace",
                fontSize: 14,
                color: isMaxed
                  ? "#F3F315"
                  : canAfford
                  ? "#39FF14"
                  : "#858585",
              }}
            >
              {isMaxed ? "MAXED" : `drink(${formatNumber(cost)})`}
            </Text>
          </Pressable>
        </View>

        <Text
          style={{
            color: "#FF073A",
            textTransform: "uppercase",
            fontSize: 11,
            fontWeight: "bold",
            letterSpacing: 1.5,
            marginBottom: 8,
            marginTop: 8,
            fontFamily: "monospace",
          }}
        >
          Danger Zone - Vibe v{rebootCount}.0.0
        </Text>
        <RebootButton />

        <View style={{ alignItems: "center", marginTop: 12 }}>
          <Text
            style={{
              color: "white",
              fontSize: 11,
              opacity: 0.35,
              textAlign: "center",
              fontFamily: "monospace",
            }}
          >
            Tap floating energy cans in Simulation to earn cans
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const EventBanner: React.FC = () => {
  const activeEvent = useGameStore((s) => s.activeEvent);
  if (!activeEvent) return null;
  const secsLeft = Math.max(0, Math.ceil((activeEvent.endsAt - Date.now()) / 1000));
  const colors: Record<string, string> = {
    code_rush: "#39FF14",
    bug_swarm: "#FF073A",
    refactor_window: "#F3F315",
    coffee_break: "#4FC1FF",
  };
  const color = colors[activeEvent.id] ?? "#39FF14";
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: `${color}15`,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <Text style={{ color, fontWeight: "bold", fontSize: 13, fontFamily: "monospace" }}>
          {activeEvent.title}
        </Text>
        <Text style={{ color: "#ccc", fontSize: 11, fontFamily: "monospace" }}>
          {activeEvent.description}
        </Text>
      </View>
      <Text style={{ color, fontWeight: "bold", fontSize: 14, fontFamily: "monospace" }}>
        {secsLeft}s
      </Text>
    </View>
  );
};

const AchievementsPanel: React.FC = () => {
  const achievements = useGameStore((s) => s.achievements);
  const categories = ["economy", "tapping", "upgrades", "meta", "secret"] as const;
  const catLabels: Record<string, string> = {
    economy: "Economy",
    tapping: "Tapping",
    upgrades: "Upgrades",
    meta: "Meta",
    secret: "Secret",
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
      <Text
        style={{
          color: "#F3F315",
          fontSize: 12,
          fontWeight: "bold",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          fontFamily: "monospace",
          marginBottom: 8,
        }}
      >
        Achievements ({achievements.length}/{ACHIEVEMENT_DEFINITIONS.length})
      </Text>
      {categories.map((cat) => {
        const defs = ACHIEVEMENT_DEFINITIONS.filter((a) => a.category === cat);
        if (defs.length === 0) return null;
        return (
          <View key={cat} style={{ marginBottom: 8 }}>
            <Text
              style={{
                color: "#888",
                fontSize: 10,
                fontWeight: "bold",
                letterSpacing: 1,
                textTransform: "uppercase",
                fontFamily: "monospace",
                marginBottom: 4,
              }}
            >
              {catLabels[cat]}
            </Text>
            {defs.map((ach) => {
              const unlocked = achievements.includes(ach.id);
              return (
                <View
                  key={ach.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 4,
                    backgroundColor: unlocked ? "#1a2a1a" : "#111",
                    marginBottom: 3,
                    gap: 8,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{unlocked ? "★" : "☆"}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: unlocked ? "#9fdf9f" : "#555",
                        fontSize: 12,
                        fontWeight: "bold",
                        fontFamily: "monospace",
                      }}
                    >
                      {ach.title}
                    </Text>
                    <Text
                      style={{
                        color: unlocked ? "#777" : "#333",
                        fontSize: 10,
                        fontFamily: "monospace",
                      }}
                    >
                      {ach.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

const StatsPanel: React.FC = () => {
  const totalTaps = useGameStore((s) => s.totalTaps);
  const totalTimePlayed = useGameStore((s) => s.totalTimePlayed);
  const totalSparksCollected = useGameStore((s) => s.totalSparksCollected);
  const totalBonusWordsClaimed = useGameStore((s) => s.totalBonusWordsClaimed);
  const highestCombo = useGameStore((s) => s.highestCombo);
  const rebootCount = useGameStore((s) => s.rebootCount);
  const locPerSecond = useGameStore((s) => s.locPerSecond);
  const lifetimeTokens = useGameStore((s) => s.lifetimeTokens);
  const serverLevel = useGameStore((s) => s.serverLevel);
  const autoCoderLevel = useGameStore((s) => s.autoCoderLevel);
  const keyboardLevel = useGameStore((s) => s.keyboardLevel);

  const hours = Math.floor(totalTimePlayed / 3600);
  const mins = Math.floor((totalTimePlayed % 3600) / 60);

  const statRow = (label: string, value: string) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: "#1a1a1a",
      }}
    >
      <Text style={{ color: "#888", fontSize: 11, fontFamily: "monospace" }}>{label}</Text>
      <Text style={{ color: "#d4d4d4", fontSize: 11, fontFamily: "monospace", fontWeight: "bold" }}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
      <Text
        style={{
          color: "#4FC1FF",
          fontSize: 12,
          fontWeight: "bold",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          fontFamily: "monospace",
          marginBottom: 8,
        }}
      >
        Statistics
      </Text>
      <View
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#222",
          backgroundColor: "#111",
          overflow: "hidden",
        }}
      >
        {statRow("Total Taps", totalTaps.toLocaleString())}
        {statRow("Time Played", `${hours}h ${mins}m`)}
        {statRow("Lifetime LoC", formatNumber(lifetimeTokens))}
        {statRow("Current LoC/sec", formatNumber(locPerSecond))}
        {statRow("Highest Combo", highestCombo.toString())}
        {statRow("Sparks Collected", totalSparksCollected.toString())}
        {statRow("Bonus Words Claimed", totalBonusWordsClaimed.toString())}
        {statRow("Total Reboots", rebootCount.toString())}
        <View style={{ padding: 8 }}>
          <Text
            style={{
              color: "#666",
              fontSize: 10,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            LoC/sec Breakdown
          </Text>
          <Text style={{ color: "#777", fontSize: 10, fontFamily: "monospace" }}>
            Server: +{(serverLevel * 0.5).toFixed(1)} | Auto-Coder: +{(autoCoderLevel * 0.3).toFixed(1)} | Keyboard: +{(keyboardLevel * 0.18).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const AutoBuyPanel: React.FC = () => {
  const autoBuyEnabled = useGameStore((s) => s.autoBuyEnabled);
  const toggleAutoBuy = useGameStore((s) => s.toggleAutoBuy);
  const rebootCount = useGameStore((s) => s.rebootCount);

  if (rebootCount < 1) return null;

  const types = [
    { key: "autoCoder", label: "Auto-Coder" },
    { key: "server", label: "Server" },
    { key: "keyboard", label: "Keyboard" },
    { key: "aiPair", label: "AI Pair" },
    { key: "gitAutopilot", label: "Git Autopilot" },
    { key: "ciPipeline", label: "CI Pipeline" },
    { key: "observability", label: "Observability" },
  ];

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
      <Text
        style={{
          color: "#C586C0",
          fontSize: 12,
          fontWeight: "bold",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          fontFamily: "monospace",
          marginBottom: 8,
        }}
      >
        Auto-Buy (unlocked via reboot)
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {types.map((t) => {
          const on = autoBuyEnabled[t.key] ?? false;
          return (
            <Pressable
              key={t.key}
              onPress={() => toggleAutoBuy(t.key)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: on ? "#39FF14" : "#333",
                backgroundColor: on ? "#1a2a1a" : "#111",
              }}
            >
              <Text
                style={{
                  color: on ? "#39FF14" : "#666",
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: "bold",
                }}
              >
                {t.label}: {on ? "ON" : "OFF"}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const SettingsModal: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const resetSave = useGameStore((s) => s.resetSave);
  const exportSave = useGameStore((s) => s.exportSave);
  const [exportString, setExportString] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExport = () => {
    setExportString(exportSave());
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetSave();
    setConfirmReset(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.8)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 400,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#333",
            backgroundColor: "#111",
            padding: 20,
          }}
        >
          <Text
            style={{
              color: "#d4d4d4",
              fontSize: 18,
              fontWeight: "bold",
              fontFamily: "monospace",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Settings
          </Text>

          <Text
            style={{
              color: "#888",
              fontSize: 10,
              fontFamily: "monospace",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            VibeCodSim v1.0.0
          </Text>

          <Pressable
            onPress={handleExport}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 6,
              backgroundColor: "#1a2a3a",
              borderWidth: 1,
              borderColor: "#2e405f",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#4FC1FF", fontFamily: "monospace", fontSize: 13, textAlign: "center" }}>
              Export Save
            </Text>
          </Pressable>

          {exportString ? (
            <View style={{ marginBottom: 10 }}>
              <TextInput
                value={exportString}
                selectTextOnFocus
                style={{
                  borderWidth: 1,
                  borderColor: "#333",
                  borderRadius: 4,
                  padding: 8,
                  color: "#999",
                  fontSize: 10,
                  fontFamily: "monospace",
                  backgroundColor: "#0a0a0a",
                  maxHeight: 80,
                }}
                multiline
                editable={false}
              />
              <Text style={{ color: "#555", fontSize: 9, fontFamily: "monospace", marginTop: 4 }}>
                Copy this string to back up your save
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleReset}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 6,
              backgroundColor: confirmReset ? "#4a0000" : "#2a0005",
              borderWidth: 1,
              borderColor: "#FF073A",
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color: "#FF073A",
                fontFamily: "monospace",
                fontSize: 13,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {confirmReset ? "TAP AGAIN TO CONFIRM RESET" : "Reset Save"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => { setConfirmReset(false); setExportString(""); onClose(); }}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 6,
              backgroundColor: "#1a1a1a",
              borderWidth: 1,
              borderColor: "#333",
            }}
          >
            <Text style={{ color: "#888", fontFamily: "monospace", fontSize: 13, textAlign: "center" }}>
              Close
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const ProgressContent: React.FC = () => {
  const lifetimeTokens = useGameStore((s) => s.lifetimeTokens);
  const architecturePoints = useGameStore((s) => s.architecturePoints);

  return (
    <ScrollView style={{ flex: 1, paddingTop: 8 }}>
      <View
        style={{
          marginHorizontal: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#2e405f",
          backgroundColor: "#111826",
          padding: 12,
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            color: "#9fb4ff",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 1.4,
            fontFamily: "monospace",
          }}
        >
          Progression Snapshot
        </Text>
        <Text
          style={{
            color: "#d4d4d4",
            fontSize: 14,
            marginTop: 4,
            fontFamily: "monospace",
          }}
        >
          Total LoC: {formatNumber(lifetimeTokens)}
        </Text>
        <Text
          style={{
            color: "#d4d4d4",
            fontSize: 14,
            marginTop: 2,
            fontFamily: "monospace",
          }}
        >
          Architecture Points: {architecturePoints}
        </Text>
      </View>
      <StatsPanel />
      <AchievementsPanel />
      <AutoBuyPanel />
      <MilestonePanel />
      <MetaTreePanel />
    </ScrollView>
  );
};

const LoadingScreen: React.FC = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: "#080808",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ color: "#4FC1FF", fontSize: 18, fontFamily: "monospace", letterSpacing: 3 }}>
      LOADING...
    </Text>
    <Text style={{ color: "#555", fontSize: 12, fontFamily: "monospace", marginTop: 8 }}>
      Hydrating game state
    </Text>
  </View>
);

const GameScreen: React.FC = () => {
  const { height, width } = useWindowDimensions();
  const [mobileTab, setMobileTab] = useState<MobileTab>("NODE");
  const [desktopSubTab, setDesktopSubTab] =
    useState<DesktopSubTab>("packages");
  const masterTick = useGameStore((s) => s.masterTick);
  const hasHydrated = useGameStore((s) => s.hasHydrated);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const offlineEarnedTokens = useGameStore((s) => s.offlineEarnedTokens);
  const offlineEarnedSeconds = useGameStore((s) => s.offlineEarnedSeconds);
  const clearOfflineToast = useGameStore((s) => s.clearOfflineToast);

  useEffect(() => {
    let animationFrameId: number;
    let fallbackInterval: ReturnType<typeof setInterval>;

    if (Platform.OS === "web") {
      const loop = (timestamp: number) => {
        masterTick(timestamp);
        animationFrameId = requestAnimationFrame(loop);
      };
      animationFrameId = requestAnimationFrame(loop);
    } else {
      fallbackInterval = setInterval(() => {
        masterTick(Date.now());
      }, 100);
    }

    return () => {
      if (Platform.OS === "web") cancelAnimationFrame(animationFrameId);
      else clearInterval(fallbackInterval);
    };
  }, [masterTick]);

  const isDesktop = width > 768;

  if (!hasHydrated) return <LoadingScreen />;

  // ── Desktop sub-tab content router ─────────────────────────────────────

  const renderDesktopSubTab = () => {
    switch (desktopSubTab) {
      case "packages":
        return <PackagesContent />;
      case "advanced":
        return <AdvancedContent />;
      case "boost":
        return <BoostContent />;
      case "progress":
        return <ProgressContent />;
    }
  };

  // ── DESKTOP LAYOUT ────────────────────────────────────────────────────

  if (isDesktop) {
    return (
      <View
        style={{
          flexDirection: "row",
          height: Platform.OS === "web" ? ("100dvh" as any) : height,
          backgroundColor: "#080808",
        }}
      >
        {/* LEFT pane -- Simulation (fills space) */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#0d0d0d",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <GraphicGamePanel />
        </View>

        {/* RIGHT pane -- Stats, sub-tabs, upgrade content */}
        <View
          style={{
            width: 420,
            borderLeftWidth: 1,
            borderColor: "#222",
            backgroundColor: "#0a0a0a",
            flexDirection: "column",
          }}
        >
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderColor: "#222",
              paddingTop: 24,
              backgroundColor: "#050505",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <TokenDisplay />
              </View>
              <Pressable onPress={() => setSettingsOpen(true)} style={{ padding: 8, marginLeft: 8 }}>
                <Settings size={18} color="#888" strokeWidth={1.5} />
              </Pressable>
            </View>
          </View>
          <EventBanner />

          <SubTabBar
            active={desktopSubTab}
            onSelect={(k) => setDesktopSubTab(k as DesktopSubTab)}
            tabs={SUB_TAB_LABELS}
          />

          <View style={{ flex: 1 }}>{renderDesktopSubTab()}</View>
        </View>

        {offlineEarnedTokens > 0 && (
          <WelcomeBackToast
            earned={offlineEarnedTokens}
            offlineSeconds={offlineEarnedSeconds}
            onDismiss={clearOfflineToast}
          />
        )}
        <ProgressToast />
        <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </View>
    );
  }

  // ── MOBILE LAYOUT ─────────────────────────────────────────────────────

  const renderMobileTab = () => {
    switch (mobileTab) {
      case "NODE":
        return <GraphicGamePanel />;
      case "PACKAGES":
        return <PackagesContent />;
      case "ADVANCED":
        return <AdvancedContent />;
      case "BOOST":
        return <BoostContent />;
      case "PROGRESS":
        return <ProgressContent />;
    }
  };

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#080808",
        height: Platform.OS === "web" ? ("100dvh" as any) : height,
      }}
    >
      <View
        style={{
          padding: 16,
          paddingTop: Math.max(insets.top, 20),
          borderBottomWidth: 1,
          borderColor: "#1a1a1a",
          backgroundColor: "#060606",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <TokenDisplay />
          </View>
          <Pressable onPress={() => setSettingsOpen(true)} style={{ padding: 8, marginLeft: 8 }}>
            <Settings size={18} color="#888" strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>
      <EventBanner />

      <View style={{ flex: 1, backgroundColor: "#080808" }}>
        {renderMobileTab()}
      </View>

      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderColor: "#1a1a1a",
          backgroundColor: "#060606",
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        }}
      >
        {MOBILE_TABS.map((t) => {
          const isActive = mobileTab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setMobileTab(t.key)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 2,
                borderBottomColor: isActive ? "#007acc" : "transparent",
              }}
            >
              <NeonText
                color={isActive ? "blue" : "white"}
                size="sm"
                style={{ opacity: isActive ? 1 : 0.4, fontSize: 13 }}
              >
                {t.label}
              </NeonText>
            </Pressable>
          );
        })}
      </View>

      {offlineEarnedTokens > 0 && (
        <WelcomeBackToast
          earned={offlineEarnedTokens}
          offlineSeconds={offlineEarnedSeconds}
          onDismiss={clearOfflineToast}
        />
      )}
      <ProgressToast />
      <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
};

export default GameScreen;
