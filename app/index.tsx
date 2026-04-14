import React, { useState, useEffect } from "react";
import {
  Platform,
  Pressable,
  useWindowDimensions,
  View,
  Text,
  ScrollView,
} from "react-native";
import { useGameStore, getEnergyTechCost } from "../store/gameStore";

import { TokenDisplay } from "../components/game/TokenDisplay";
import { UpgradeCard } from "../components/game/UpgradeCard";
import { RebootButton } from "../components/game/RebootButton";
import { MetaTreePanel } from "../components/game/MetaTreePanel";
import { MilestonePanel } from "../components/game/MilestonePanel";
import { GraphicGamePanel } from "../components/ui/GraphicGamePanel";
import { WelcomeBackToast } from "../components/ui/WelcomeBackToast";
import { ProgressToast } from "../components/ui/ProgressToast";
import { NeonText } from "../components/ui/NeonText";
import { Battery } from "lucide-react-native";
import { formatNumber } from "../utils/formatNumber";

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
  const rebootCount = useGameStore((s) => s.rebootCount);
  const purchaseEnergyUpgrade = useGameStore((s) => s.purchaseEnergyUpgrade);
  const cost = getEnergyTechCost(techLevel);
  const canAfford = energyDrinks >= cost;
  const isMaxed = techLevel >= 20;

  const bonus = (
    techLevel *
    0.2 *
    (1 / (1 + techLevel * 0.05)) *
    100
  ).toFixed(0);

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
                Lv.{techLevel} (+{bonus}% income boost)
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
      <MilestonePanel />
      <MetaTreePanel />
    </ScrollView>
  );
};

const GameScreen: React.FC = () => {
  const { height, width } = useWindowDimensions();
  const [mobileTab, setMobileTab] = useState<MobileTab>("NODE");
  const [desktopSubTab, setDesktopSubTab] =
    useState<DesktopSubTab>("packages");
  const masterTick = useGameStore((s) => s.masterTick);

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
          height: Platform.OS === "web" ? ("100vh" as any) : height,
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
            <TokenDisplay />
          </View>

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
        height: Platform.OS === "web" ? ("100vh" as any) : height,
      }}
    >
      <View
        style={{
          padding: 16,
          paddingTop: 48,
          borderBottomWidth: 1,
          borderColor: "#1a1a1a",
          backgroundColor: "#060606",
        }}
      >
        <TokenDisplay />
      </View>

      <View style={{ flex: 1, backgroundColor: "#080808" }}>
        {renderMobileTab()}
      </View>

      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderColor: "#1a1a1a",
          backgroundColor: "#060606",
          paddingBottom: 24,
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
                paddingVertical: 6,
                borderBottomWidth: 2,
                borderBottomColor: isActive ? "#007acc" : "transparent",
              }}
            >
              <NeonText
                color={isActive ? "blue" : "white"}
                size="sm"
                style={{ opacity: isActive ? 1 : 0.4, fontSize: 11 }}
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
    </View>
  );
};

export default GameScreen;
