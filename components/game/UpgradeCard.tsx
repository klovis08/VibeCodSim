import React from "react";
import { Pressable, View, Text } from "react-native";
import { Terminal, Server, Keyboard, Lock, Cpu, GitBranch, Zap, Workflow, Radar } from "lucide-react-native";

import { useGameStore, getTierUnlockRequirement, getUpgradeCostMultiplier } from "../../store/gameStore";
import { getUpgradeCost, getUpgradeTierLabel } from "../../utils/scaling";
import { formatNumber } from "../../utils/formatNumber";

import type { UpgradeType } from "../../utils/scaling";

interface UpgradeCardProps {
  type: "autoCoder" | "server" | "keyboard" | "aiPair" | "gitAutopilot" | "cloudBurst" | "ciPipeline" | "observability";
  title: string;
  unlocksAt?: number;
  description?: string;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  type,
  title,
  unlocksAt,
  description,
}) => {
  const neuralTokens = useGameStore((s) => s.neuralTokens);
  const lifetimeTokens = useGameStore((s) => s.lifetimeTokens);
  const rebootCount = useGameStore((s) => s.rebootCount);
  const milestoneClaims = useGameStore((s) => s.milestoneClaims);
  const unlockedMetaNodes = useGameStore((s) => s.unlockedMetaNodes);
  const energyDrinks = useGameStore((s) => s.energyDrinks);
  const cloudBurstCooldown = useGameStore((s) => s.cloudBurstCooldown);
  const cloudBurstActive = useGameStore((s) => s.cloudBurstActive);

  const level = useGameStore((s) => {
    if (type === "autoCoder") return s.autoCoderLevel;
    if (type === "server") return s.serverLevel;
    if (type === "keyboard") return s.keyboardLevel;
    if (type === "aiPair") return s.aiPairLevel;
    if (type === "gitAutopilot") return s.gitAutopilotLevel;
    if (type === "ciPipeline") return s.ciPipelineLevel;
    if (type === "observability") return s.observabilityLevel;
    return 0;
  });

  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade);
  const purchaseHiddenUpgrade = useGameStore((s) => s.purchaseHiddenUpgrade);
  const activateCloudBurst = useGameStore((s) => s.activateCloudBurst);

  // ── LOCKED STATE ──────────────────────────────────────────────────────────
  const lockedByLegacyThreshold = unlocksAt !== undefined && lifetimeTokens < unlocksAt;
  const lifetimeRequirement =
    type === "aiPair"
      ? 500
      : type === "gitAutopilot"
      ? 5_000
      : type === "cloudBurst"
      ? 50_000
      : type === "ciPipeline"
      ? 250_000
      : type === "observability"
      ? 1_000_000
      : undefined;
  const rebootRequirement = type === "ciPipeline" ? 1 : type === "observability" ? 2 : undefined;
  const requiredMilestoneId =
    type === "ciPipeline"
      ? "m_first_reboot"
      : type === "observability"
      ? "m_scale_1m"
      : undefined;

  const isLocked =
    lockedByLegacyThreshold ||
    (lifetimeRequirement !== undefined && lifetimeTokens < lifetimeRequirement) ||
    (rebootRequirement !== undefined && rebootCount < rebootRequirement) ||
    (requiredMilestoneId !== undefined && !milestoneClaims.includes(requiredMilestoneId));

  const lockReasons: string[] = [];
  if (lifetimeRequirement !== undefined && lifetimeTokens < lifetimeRequirement) {
    lockReasons.push(`Need ${formatNumber(lifetimeRequirement)} total LoC`);
  }
  if (rebootRequirement !== undefined && rebootCount < rebootRequirement) {
    lockReasons.push(`Need ${rebootRequirement} reboot(s)`);
  }
  if (requiredMilestoneId && !milestoneClaims.includes(requiredMilestoneId)) {
    lockReasons.push("Need milestone unlock");
  }

  if (isLocked) {
    return (
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 16,
          padding: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#252525",
          backgroundColor: "#111",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          opacity: 0.5,
        }}
      >
        <View style={{ backgroundColor: "#1a1a1a", borderRadius: 8, padding: 12 }}>
          <Lock size={20} color="#444" strokeWidth={1.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#444", fontWeight: "500", fontSize: 15, fontFamily: "monospace" }}>
            ???
          </Text>
          <Text style={{ color: "#333", fontSize: 12, marginTop: 3, fontFamily: "monospace" }}>
            {lockReasons[0] ?? `Unlock at ${formatNumber(unlocksAt ?? 0)} LoC`}
          </Text>
          {lockReasons[1] && (
            <Text style={{ color: "#2d2d2d", fontSize: 11, marginTop: 2, fontFamily: "monospace" }}>
              {lockReasons[1]}
            </Text>
          )}
        </View>
      </View>
    );
  }

  // ── CLOUD BURST (active ability) ──────────────────────────────────────────
  if (type === "cloudBurst") {
    const now = Date.now();
    const onCooldown = cloudBurstCooldown > now;
    const cooldownSecsLeft = onCooldown
      ? Math.ceil((cloudBurstCooldown - now) / 1000)
      : 0;
    const canActivate = !onCooldown && !cloudBurstActive && energyDrinks >= 1;

    return (
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 16,
          padding: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: cloudBurstActive ? "#39FF14" : "#333",
          backgroundColor: "#252526",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View style={{ backgroundColor: "#1e1e1e", borderRadius: 8, padding: 12 }}>
            <Zap
              size={24}
              color={cloudBurstActive ? "#39FF14" : canActivate ? "#4FC1FF" : "#858585"}
              strokeWidth={1.5}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "500", color: cloudBurstActive ? "#39FF14" : canActivate ? "#d4d4d4" : "#858585" }}>
              {title}
            </Text>
            <Text style={{ color: "#858585", fontSize: 13, marginTop: 4, fontFamily: "monospace" }}>
              {cloudBurstActive
                ? "2× ACTIVE"
                : onCooldown
                ? `Cooldown: ${cooldownSecsLeft}s`
                : description ?? "2× income for 30s"}
            </Text>
          </View>
          <Pressable
            onPress={activateCloudBurst}
            disabled={!canActivate}
            style={{
              borderRadius: 4,
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: canActivate ? "#0e639c" : "#333333",
            }}
          >
            <Text style={{ fontFamily: "monospace", fontSize: 14, color: canActivate ? "#ffffff" : "#858585" }}>
              {canActivate ? "activate(1🥤)" : onCooldown ? "wait..." : "need 🥤"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── STANDARD + HIDDEN UPGRADES ─────────────────────────────────────────────
  const usesAdvancedAction =
    type === "aiPair" ||
    type === "gitAutopilot" ||
    type === "ciPipeline" ||
    type === "observability";
  const costMultiplier = getUpgradeCostMultiplier(type as UpgradeType);
  const metaDiscount = unlockedMetaNodes.includes("couponCompiler") ? 0.12 : 0;
  const cost = getUpgradeCost(level, { costMultiplier, metaDiscount });
  const nextCost = getUpgradeCost(level + 1, { costMultiplier, metaDiscount });
  const canAfford = neuralTokens >= cost;
  const tierLabel = getUpgradeTierLabel(level);
  const tierRequirement = getTierUnlockRequirement(Math.floor(level / 20) + 1);
  const tierUnlocked = lifetimeTokens >= tierRequirement;

  const getIcon = () => {
    if (type === "server") return <Server size={24} color={canAfford ? "#4FC1FF" : "#858585"} strokeWidth={1.5} />;
    if (type === "keyboard") return <Keyboard size={24} color={canAfford ? "#4FC1FF" : "#858585"} strokeWidth={1.5} />;
    if (type === "aiPair") return <Cpu size={24} color={canAfford ? "#C586C0" : "#858585"} strokeWidth={1.5} />;
    if (type === "gitAutopilot") return <GitBranch size={24} color={canAfford ? "#4EC9B0" : "#858585"} strokeWidth={1.5} />;
    if (type === "ciPipeline") return <Workflow size={24} color={canAfford ? "#F3F315" : "#858585"} strokeWidth={1.5} />;
    if (type === "observability") return <Radar size={24} color={canAfford ? "#39FF14" : "#858585"} strokeWidth={1.5} />;
    return <Terminal size={24} color={canAfford ? "#4FC1FF" : "#858585"} strokeWidth={1.5} />;
  };

  const handleBuy = () => {
    if (usesAdvancedAction) {
      purchaseHiddenUpgrade(type as "aiPair" | "gitAutopilot" | "ciPipeline" | "observability");
    } else {
      purchaseUpgrade(type as "autoCoder" | "server" | "keyboard");
    }
  };

  const accentColor =
    type === "aiPair"
      ? "#C586C0"
      : type === "gitAutopilot"
      ? "#4EC9B0"
      : type === "ciPipeline"
      ? "#F3F315"
      : type === "observability"
      ? "#39FF14"
      : "#4FC1FF";
  const buttonBg =
    canAfford
      ? type === "aiPair"
        ? "#2d0a2e"
        : type === "gitAutopilot"
        ? "#0a2d29"
        : type === "ciPipeline"
        ? "#3a3a02"
        : type === "observability"
        ? "#12401f"
        : "#0e639c"
      : "#333333";

  const currentContribution =
    type === "autoCoder"
      ? `+${(level * 0.3).toFixed(1)}/sec, +${(level * 0.5).toFixed(1)} tap`
      : type === "server"
      ? `+${(level * 0.5).toFixed(1)}/sec passive`
      : type === "keyboard"
      ? `+${(level * 0.18).toFixed(2)}/sec, +${(level * 0.08).toFixed(2)} tap`
      : type === "aiPair"
      ? `-${Math.min(80, level * 15)}% strain`
      : type === "gitAutopilot"
      ? `+${level * 10}% passive mult`
      : type === "ciPipeline"
      ? `+${level * 20}% passive mult`
      : `+${level * 35}% global mult`;

  const nextGain =
    type === "autoCoder"
      ? "+0.30/sec, +0.50 tap"
      : type === "server"
      ? "+0.50/sec"
      : type === "keyboard"
      ? "+0.18/sec, +0.08 tap"
      : type === "aiPair"
      ? "-15% strain"
      : type === "gitAutopilot"
      ? "+10% passive mult"
      : type === "ciPipeline"
      ? "+20% passive mult"
      : "+35% global mult";

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: usesAdvancedAction ? (canAfford ? accentColor + "55" : "#333") : "#333333",
        backgroundColor: "#252526",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <View style={{ backgroundColor: "#1e1e1e", borderRadius: 8, padding: 12 }}>
          {getIcon()}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "500", color: canAfford ? "#d4d4d4" : "#858585" }}>
            {title}
          </Text>
          <Text style={{ color: "#4FC1FF", fontSize: 12, marginTop: 2, fontFamily: "monospace" }}>
            Lv.{level} {tierLabel} — {currentContribution}
          </Text>
          <Text style={{ color: "#858585", fontSize: 11, marginTop: 3, fontFamily: "monospace" }}>
            {description}
          </Text>
          <Text style={{ color: "#9fdf9f", fontSize: 11, marginTop: 2, fontFamily: "monospace" }}>
            Next lv: {nextGain}
          </Text>
          {!tierUnlocked && (
            <Text style={{ color: "#5a3521", fontSize: 11, marginTop: 2, fontFamily: "monospace" }}>
              Tier gate: {formatNumber(tierRequirement)} total LoC
            </Text>
          )}
        </View>
        <Pressable
          onPress={handleBuy}
          disabled={!canAfford || !tierUnlocked}
          style={{ borderRadius: 4, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: buttonBg }}
        >
          <Text style={{ fontFamily: "monospace", fontSize: 14, color: canAfford ? "#ffffff" : "#858585" }}>
            install({formatNumber(cost)})
          </Text>
          <Text style={{ fontFamily: "monospace", fontSize: 10, color: canAfford ? "#cfd8dc" : "#757575", marginTop: 2, textAlign: "center" }}>
            next {formatNumber(nextCost)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
