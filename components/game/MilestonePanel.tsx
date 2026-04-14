import React from "react";
import { Pressable, Text, View } from "react-native";
import { MILESTONES, useGameStore } from "../../store/gameStore";
import { formatNumber } from "../../utils/formatNumber";

export const MilestonePanel: React.FC = () => {
  const lifetimeTokens = useGameStore((s) => s.lifetimeTokens);
  const rebootCount = useGameStore((s) => s.rebootCount);
  const milestoneClaims = useGameStore((s) => s.milestoneClaims);
  const claimMilestone = useGameStore((s) => s.claimMilestone);

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
      <Text
        style={{
          color: "#39FF14",
          textTransform: "uppercase",
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 1.5,
          marginBottom: 8,
          fontFamily: "monospace",
        }}
      >
        Milestones
      </Text>

      {MILESTONES.map((milestone) => {
        const claimed = milestoneClaims.includes(milestone.id);
        const locTarget = milestone.lifetimeTokens ?? 0;
        const rebootTarget = milestone.rebootCount ?? 0;
        const locProgress = locTarget === 0 ? 1 : Math.min(1, lifetimeTokens / locTarget);
        const rebootProgress = rebootTarget === 0 ? 1 : Math.min(1, rebootCount / rebootTarget);
        const done = locProgress >= 1 && rebootProgress >= 1;
        const canClaim = done && !claimed;
        const blendedProgress = Math.min(1, (locProgress + rebootProgress) / 2);

        return (
          <View
            key={milestone.id}
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: claimed ? "#2a5331" : canClaim ? "#416846" : "#2b2b2b",
              backgroundColor: claimed ? "#102014" : "#171717",
              padding: 12,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: claimed ? "#85cf91" : "#d4d4d4", fontWeight: "600", fontSize: 14 }}>
              {milestone.title}
            </Text>
            <Text style={{ color: "#8b8b8b", fontSize: 12, marginTop: 3 }}>
              {milestone.description}
            </Text>
            {locTarget > 0 && (
              <Text style={{ color: "#7c7c7c", fontSize: 11, marginTop: 4, fontFamily: "monospace" }}>
                LoC: {formatNumber(lifetimeTokens)} / {formatNumber(locTarget)}
              </Text>
            )}
            {rebootTarget > 0 && (
              <Text style={{ color: "#7c7c7c", fontSize: 11, marginTop: 2, fontFamily: "monospace" }}>
                Reboots: {rebootCount} / {rebootTarget}
              </Text>
            )}
            <Text style={{ color: "#5f7fbd", fontSize: 11, marginTop: 4, fontFamily: "monospace" }}>
              Reward: +{milestone.rewardTokens ?? 0} LoC · +{milestone.rewardEnergyDrinks ?? 0} cans · +{milestone.rewardArchitecturePoints ?? 0} AP
            </Text>
            <View style={{ marginTop: 8, height: 6, borderRadius: 999, backgroundColor: "#0f0f0f", borderWidth: 1, borderColor: "#2d2d2d", overflow: "hidden" }}>
              <View
                style={{
                  width: `${Math.floor(blendedProgress * 100)}%`,
                  height: "100%",
                  backgroundColor: claimed ? "#3a8f4b" : canClaim ? "#57b26b" : "#37538f",
                }}
              />
            </View>
            <Pressable
              onPress={() => claimMilestone(milestone.id)}
              disabled={!canClaim}
              style={{
                marginTop: 8,
                borderRadius: 6,
                paddingVertical: 8,
                alignItems: "center",
                backgroundColor: claimed ? "#1d3c23" : canClaim ? "#235838" : "#333",
              }}
            >
              <Text style={{ color: claimed ? "#95d8a2" : canClaim ? "#d9ffe4" : "#8a8a8a", fontSize: 12, fontFamily: "monospace" }}>
                {claimed ? "Claimed" : canClaim ? "Claim Reward" : "In Progress"}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};
