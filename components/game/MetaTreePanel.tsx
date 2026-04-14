import React from "react";
import { Pressable, Text, View } from "react-native";
import { META_NODE_DEFINITIONS, useGameStore } from "../../store/gameStore";

const TREE_LAYOUT: Record<string, { x: number; y: number }> = {
  steadyHands:    { x: 50, y: 0 },
  threadOptimizer:{ x: 25, y: 1 },
  couponCompiler: { x: 75, y: 1 },
  sparkMagnet:    { x: 15, y: 2 },
  burstDaemon:    { x: 50, y: 2 },
  architectMind:  { x: 50, y: 3 },
};

const NODE_W = 120;
const NODE_H = 60;
const ROW_H = 90;
const PADDING_TOP = 12;

const ConnectionLine: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  active: boolean;
}> = ({ fromX, fromY, toX, toY, active }) => {
  const x1 = fromX;
  const y1 = fromY;
  const x2 = toX;
  const y2 = toY;

  const midY = (y1 + y2) / 2;

  return (
    <>
      <View
        style={{
          position: "absolute",
          left: Math.min(x1, x2),
          top: y1,
          width: 2,
          height: midY - y1,
          backgroundColor: active ? "#39FF1466" : "#33405a",
        }}
      />
      <View
        style={{
          position: "absolute",
          left: Math.min(x1, x2),
          top: midY,
          width: Math.abs(x2 - x1) + 2,
          height: 2,
          backgroundColor: active ? "#39FF1466" : "#33405a",
        }}
      />
      <View
        style={{
          position: "absolute",
          left: x2,
          top: midY,
          width: 2,
          height: y2 - midY,
          backgroundColor: active ? "#39FF1466" : "#33405a",
        }}
      />
    </>
  );
};

export const MetaTreePanel: React.FC = () => {
  const architecturePoints = useGameStore((s) => s.architecturePoints);
  const unlockedMetaNodes = useGameStore((s) => s.unlockedMetaNodes);
  const purchaseMetaNode = useGameStore((s) => s.purchaseMetaNode);
  const respecMetaTree = useGameStore((s) => s.respecMetaTree);

  const containerWidth = 320;
  const totalRows = 4;
  const containerHeight = totalRows * ROW_H + PADDING_TOP + 20;

  const getNodeCenter = (nodeId: string) => {
    const layout = TREE_LAYOUT[nodeId];
    if (!layout) return { cx: 0, cy: 0 };
    const cx = (layout.x / 100) * containerWidth;
    const cy = PADDING_TOP + layout.y * ROW_H + NODE_H / 2;
    return { cx, cy };
  };

  const connections: { from: string; to: string }[] = [];
  for (const node of META_NODE_DEFINITIONS) {
    for (const req of node.requires) {
      connections.push({ from: req, to: node.id });
    }
  }

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

      <View
        style={{
          width: containerWidth,
          height: containerHeight,
          alignSelf: "center",
          position: "relative",
        }}
      >
        {connections.map((conn) => {
          const from = getNodeCenter(conn.from);
          const to = getNodeCenter(conn.to);
          const bothUnlocked = unlockedMetaNodes.includes(conn.from) && unlockedMetaNodes.includes(conn.to);
          return (
            <ConnectionLine
              key={`${conn.from}-${conn.to}`}
              fromX={from.cx}
              fromY={from.cy + NODE_H / 2}
              toX={to.cx}
              toY={to.cy - NODE_H / 2}
              active={bothUnlocked}
            />
          );
        })}

        {META_NODE_DEFINITIONS.map((node) => {
          const layout = TREE_LAYOUT[node.id];
          if (!layout) return null;
          const unlocked = unlockedMetaNodes.includes(node.id);
          const prereqsMet = node.requires.every((id) => unlockedMetaNodes.includes(id));
          const canAfford = architecturePoints >= node.cost;
          const canBuy = !unlocked && prereqsMet && canAfford;

          const left = (layout.x / 100) * containerWidth - NODE_W / 2;
          const top = PADDING_TOP + layout.y * ROW_H;

          return (
            <Pressable
              key={node.id}
              onPress={() => canBuy && purchaseMetaNode(node.id)}
              style={{
                position: "absolute",
                left,
                top,
                width: NODE_W,
                height: NODE_H,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: unlocked
                  ? "#39FF14"
                  : canBuy
                  ? "#4FC1FF"
                  : prereqsMet
                  ? "#33405a"
                  : "#222",
                backgroundColor: unlocked
                  ? "#0f2512"
                  : canBuy
                  ? "#0e1d30"
                  : "#161a22",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 4,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: unlocked ? "#7bff68" : canBuy ? "#cce0ff" : "#666",
                  fontWeight: "700",
                  fontSize: 10,
                  fontFamily: "monospace",
                  textAlign: "center",
                }}
              >
                {node.title}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: unlocked ? "#5a9f50" : "#555",
                  fontSize: 8,
                  fontFamily: "monospace",
                  textAlign: "center",
                  marginTop: 2,
                }}
              >
                {node.description}
              </Text>
              <Text
                style={{
                  color: unlocked ? "#39FF14" : canAfford ? "#4FC1FF" : "#555",
                  fontSize: 9,
                  fontFamily: "monospace",
                  marginTop: 2,
                  fontWeight: "bold",
                }}
              >
                {unlocked ? "✓" : `${node.cost} AP`}
              </Text>
            </Pressable>
          );
        })}
      </View>

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
