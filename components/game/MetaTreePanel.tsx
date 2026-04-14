import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { META_NODE_DEFINITIONS, useGameStore } from "../../store/gameStore";

export const MetaTreePanel: React.FC = () => {
  const architecturePoints = useGameStore((s) => s.architecturePoints);
  const unlockedMetaNodes = useGameStore((s) => s.unlockedMetaNodes);
  const purchaseMetaNode = useGameStore((s) => s.purchaseMetaNode);
  const respecMetaTree = useGameStore((s) => s.respecMetaTree);

  return (
    <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 16 }}>
      <View
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#36435c",
          backgroundColor: "#0e1219",
          padding: 12,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: "#9fb4ff", fontSize: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1.4 }}>
          Meta Tree
        </Text>
        <Text style={{ color: "#d4d4d4", fontSize: 18, fontFamily: "monospace", fontWeight: "700", marginTop: 4 }}>
          {architecturePoints} AP
        </Text>
        <Text style={{ color: "#7f8aa1", fontSize: 11, fontFamily: "monospace", marginTop: 3 }}>
          Spend Architecture Points for permanent bonuses
        </Text>
      </View>

      <ScrollView style={{ maxHeight: 270 }}>
        {META_NODE_DEFINITIONS.map((node) => {
          const unlocked = unlockedMetaNodes.includes(node.id);
          const prereqsMet = node.requires.every((id) => unlockedMetaNodes.includes(id));
          const canAfford = architecturePoints >= node.cost;
          const canBuy = !unlocked && prereqsMet && canAfford;
          return (
            <View
              key={node.id}
              style={{
                marginBottom: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: unlocked ? "#39FF14AA" : prereqsMet ? "#33405a" : "#2b2b2b",
                backgroundColor: unlocked ? "#0f2512" : "#161a22",
                padding: 12,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: unlocked ? "#7bff68" : "#d4d4d4", fontWeight: "600", fontSize: 14 }}>
                    {node.title}
                  </Text>
                  <Text style={{ color: "#8b96ac", marginTop: 2, fontSize: 12, fontFamily: "monospace" }}>
                    {node.description}
                  </Text>
                  {node.requires.length > 0 && (
                    <Text style={{ color: "#66718a", marginTop: 4, fontSize: 10, fontFamily: "monospace" }}>
                      Requires: {node.requires.join(", ")}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={() => purchaseMetaNode(node.id)}
                  disabled={!canBuy}
                  style={{
                    marginLeft: 12,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: unlocked ? "#194f24" : canBuy ? "#29416f" : "#2f3440",
                  }}
                >
                  <Text style={{ color: unlocked ? "#8fffa0" : canBuy ? "#dce6ff" : "#7f8698", fontSize: 12, fontFamily: "monospace" }}>
                    {unlocked ? "OWNED" : `${node.cost} AP`}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={respecMetaTree}
        style={{
          marginTop: 8,
          borderRadius: 6,
          paddingVertical: 9,
          alignItems: "center",
          backgroundColor: "#2f2230",
          borderWidth: 1,
          borderColor: "#6f4a72",
        }}
      >
        <Text style={{ color: "#e7b6ec", fontFamily: "monospace", fontSize: 12 }}>
          Respec Tree (80% refund)
        </Text>
      </Pressable>
    </View>
  );
};
