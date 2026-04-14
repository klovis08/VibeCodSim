export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: "#0a7ea4",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#0a7ea4",
  },
  dark: {
    text: "#ECEDEE",
    background: "#080808",
    tint: "#00D4FF",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#00D4FF",
  },
};

export const T = {
  bg: {
    base: "#080808",
    surface: "#111111",
    elevated: "#1a1a1a",
    overlay: "#252526",
    deep: "#060606",
    panel: "#0a0a0a",
  },
  border: {
    subtle: "#1e1e1e",
    default: "#333333",
    focus: "#444444",
  },
  text: {
    primary: "#e4e4e4",
    secondary: "#a0a0a0",
    muted: "#666666",
    disabled: "#444444",
  },
  accent: {
    blue: "#00D4FF",
    blueAlt: "#4FC1FF",
    green: "#39FF14",
    red: "#FF073A",
    yellow: "#F3F315",
    purple: "#C586C0",
    teal: "#4EC9B0",
  },
  font: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 20,
    "2xl": 28,
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  motion: {
    fast: 100,
    normal: 250,
    slow: 600,
  },
  mono: "monospace" as const,

  upgradeAccent: (type: string): string => {
    switch (type) {
      case "aiPair": return "#C586C0";
      case "gitAutopilot": return "#4EC9B0";
      case "ciPipeline": return "#F3F315";
      case "observability": return "#39FF14";
      default: return "#4FC1FF";
    }
  },

  upgradeButtonBg: (type: string, canAfford: boolean): string => {
    if (!canAfford) return "#2a2a2a";
    switch (type) {
      case "aiPair": return "#2d0a2e";
      case "gitAutopilot": return "#0a2d29";
      case "ciPipeline": return "#3a3a02";
      case "observability": return "#12401f";
      default: return "#0e639c";
    }
  },
} as const;
