import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getTierUnlockRequirement,
  getUpgradeCost,
  getUpgradeUnlockRequirement,
  type UpgradeType,
} from "../utils/scaling";
import { gameMechanics } from "../utils/mechanics";

export interface Spark {
  id: string;
  x: number;
  y: number;
  value: number;
  expiresAt: number;
}

export interface MetaNodeDefinition {
  id: string;
  title: string;
  description: string;
  cost: number;
  requires: string[];
}

export interface MilestoneDefinition {
  id: string;
  title: string;
  description: string;
  lifetimeTokens?: number;
  rebootCount?: number;
  rewardTokens?: number;
  rewardEnergyDrinks?: number;
  rewardArchitecturePoints?: number;
}

export interface GameNotification {
  id: string;
  title: string;
  message: string;
}

interface MetaEffects {
  tapMultiplier: number;
  passiveMultiplier: number;
  costDiscount: number;
  sparkChanceMultiplier: number;
  sparkRewardMultiplier: number;
  strainMultiplier: number;
  cloudBurstDurationBonus: number;
}

interface GameState {
  saveVersion: number;
  hasHydrated: boolean;
  hydrationStarted: boolean;

  neuralTokens: number;
  lifetimeTokens: number;
  locPerSecond: number;
  tapPower: number;
  incomeMultiplier: number;

  autoCoderLevel: number;
  serverLevel: number;
  keyboardLevel: number;
  aiPairLevel: number;
  gitAutopilotLevel: number;
  ciPipelineLevel: number;
  observabilityLevel: number;

  cloudBurstActive: boolean;
  cloudBurstCooldown: number;
  cloudBurstEndsAt: number;

  strainLevel: number;
  isBurnedOut: boolean;
  activeSparks: Spark[];

  energyDrinks: number;
  energyTechLevel: number;
  rebootCount: number;

  architecturePoints: number;
  unlockedMetaNodes: string[];
  milestoneClaims: string[];

  activeBonusWord: string | null;
  bonusWordExpiresAt: number | null;
  bonusWordPosition: { x: number; y: number } | null;

  activeNotification: GameNotification | null;

  lastTickTime: number;
  offlineEarnedTokens: number;
  offlineEarnedSeconds: number;
}

interface GameActions {
  tapProgrammer: () => void;
  purchaseUpgrade: (
    type: "autoCoder" | "server" | "keyboard"
  ) => void;
  purchaseHiddenUpgrade: (
    type: "aiPair" | "gitAutopilot" | "ciPipeline" | "observability"
  ) => void;
  activateCloudBurst: () => void;
  triggerRandomBonusWord: () => void;
  claimBonusWord: () => void;
  masterTick: (timestamp: number) => void;
  collectSpark: (id: string) => void;
  purchaseEnergyUpgrade: () => void;
  purchaseMetaNode: (nodeId: string) => void;
  respecMetaTree: () => void;
  claimMilestone: (milestoneId: string) => void;
  reboot: () => void;
  clearOfflineToast: () => void;
  dismissNotification: () => void;
}

type GameStore = GameState & GameActions;

const SAVE_VERSION = 2;
const STORAGE_KEY_LAST_ACTIVE = "vibecodesim_last_active";
const STORAGE_KEY_SAVE = "vibecodesim_save_v2";

const BONUS_WORDS = [
  "function",
  "await",
  "async",
  "interface",
  "yield",
  "class",
  "useEffect",
  "const",
  "return",
  "catch",
  "deploy",
  "commit",
  "push",
  "refactor",
  "debug",
];

const BONUS_WORD_DURATION = 5000;
const MAX_OFFLINE_SECONDS = 4 * 60 * 60;
const CLOUD_BURST_DURATION = 30;
const CLOUD_BURST_COOLDOWN = 45;
const REBOOT_THRESHOLD = 1_000_000;
const SAVE_THROTTLE_MS = 1200;
let lastPersistedAt = 0;

const META_NODE_DEFINITIONS: MetaNodeDefinition[] = [
  {
    id: "steadyHands",
    title: "Steady Hands",
    description: "10% less strain per tap",
    cost: 1,
    requires: [],
  },
  {
    id: "threadOptimizer",
    title: "Thread Optimizer",
    description: "+18% passive LoC/sec",
    cost: 2,
    requires: ["steadyHands"],
  },
  {
    id: "couponCompiler",
    title: "Coupon Compiler",
    description: "12% cheaper upgrades",
    cost: 2,
    requires: ["steadyHands"],
  },
  {
    id: "sparkMagnet",
    title: "Spark Magnet",
    description: "30% better spark drops",
    cost: 3,
    requires: ["threadOptimizer"],
  },
  {
    id: "burstDaemon",
    title: "Burst Daemon",
    description: "Cloud Burst lasts 12s longer",
    cost: 3,
    requires: ["threadOptimizer", "couponCompiler"],
  },
  {
    id: "architectMind",
    title: "Architect Mind",
    description: "15% global income boost",
    cost: 5,
    requires: ["sparkMagnet", "burstDaemon"],
  },
];

const META_NODE_BY_ID: Record<string, MetaNodeDefinition> =
  META_NODE_DEFINITIONS.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {} as Record<string, MetaNodeDefinition>);

const MILESTONES: MilestoneDefinition[] = [
  {
    id: "m_first_50k",
    title: "Hello Production",
    description: "Reach 50,000 total generated LoC",
    lifetimeTokens: 50_000,
    rewardEnergyDrinks: 3,
    rewardArchitecturePoints: 1,
  },
  {
    id: "m_first_reboot",
    title: "Version 2",
    description: "Perform your first reboot",
    rebootCount: 1,
    rewardArchitecturePoints: 2,
  },
  {
    id: "m_scale_1m",
    title: "Scaled Systems",
    description: "Reach 1,000,000 total generated LoC",
    lifetimeTokens: 1_000_000,
    rewardTokens: 15_000,
    rewardArchitecturePoints: 2,
  },
  {
    id: "m_scale_10m",
    title: "Planetary Deploy",
    description: "Reach 10,000,000 total generated LoC",
    lifetimeTokens: 10_000_000,
    rewardTokens: 250_000,
    rewardEnergyDrinks: 25,
    rewardArchitecturePoints: 4,
  },
  {
    id: "m_reboot_5",
    title: "Ops Veteran",
    description: "Reach reboot count 5",
    rebootCount: 5,
    rewardArchitecturePoints: 6,
  },
];

const getPrestigeMultiplier = (energyTechLevel: number): number => {
  return 1 + energyTechLevel * 0.2 * (1 / (1 + energyTechLevel * 0.05));
};

const getEnergyTechCost = (level: number): number => {
  return Math.floor(5 * Math.pow(2.5, level));
};

const makeNotification = (title: string, message: string): GameNotification => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title,
  message,
});

const getMetaEffects = (state: Pick<GameState, "unlockedMetaNodes">): MetaEffects => {
  const has = (id: string) => state.unlockedMetaNodes.includes(id);
  return {
    tapMultiplier: has("architectMind") ? 1.15 : 1,
    passiveMultiplier: (has("threadOptimizer") ? 1.18 : 1) * (has("architectMind") ? 1.15 : 1),
    costDiscount: has("couponCompiler") ? 0.12 : 0,
    sparkChanceMultiplier: has("sparkMagnet") ? 1.25 : 1,
    sparkRewardMultiplier: has("sparkMagnet") ? 1.3 : 1,
    strainMultiplier: has("steadyHands") ? 0.9 : 1,
    cloudBurstDurationBonus: has("burstDaemon") ? 12 : 0,
  };
};

const getUpgradeLevel = (state: GameState, type: UpgradeType): number => {
  if (type === "autoCoder") return state.autoCoderLevel;
  if (type === "server") return state.serverLevel;
  if (type === "keyboard") return state.keyboardLevel;
  if (type === "aiPair") return state.aiPairLevel;
  if (type === "gitAutopilot") return state.gitAutopilotLevel;
  if (type === "ciPipeline") return state.ciPipelineLevel;
  if (type === "observability") return state.observabilityLevel;
  return 0;
};

const getUpgradeCostMultiplier = (type: UpgradeType): number => {
  if (type === "server") return 1.4;
  if (type === "keyboard") return 1.2;
  if (type === "aiPair") return 3;
  if (type === "gitAutopilot") return 5;
  if (type === "ciPipeline") return 6.5;
  if (type === "observability") return 8;
  return 1;
};

const isUpgradeUnlocked = (state: GameState, type: UpgradeType): boolean => {
  const requirements = getUpgradeUnlockRequirement(type);
  if (requirements.lifetimeTokens && state.lifetimeTokens < requirements.lifetimeTokens) {
    return false;
  }
  if (requirements.rebootCount && state.rebootCount < requirements.rebootCount) {
    return false;
  }
  if (type === "ciPipeline" && !state.milestoneClaims.includes("m_first_reboot")) {
    return false;
  }
  if (type === "observability" && !state.milestoneClaims.includes("m_scale_1m")) {
    return false;
  }
  return true;
};

const buildIncomeSnapshot = (
  state: GameState,
  includeCloudBurst: boolean
): { passivePerSecond: number; tapPower: number; incomeMultiplier: number } => {
  const meta = getMetaEffects(state);
  const prestigeMultiplier = getPrestigeMultiplier(state.energyTechLevel);
  const gitBonus = 1 + state.gitAutopilotLevel * 0.1;
  const ciBonus = 1 + state.ciPipelineLevel * 0.2;
  const obsBonus = 1 + state.observabilityLevel * 0.35;
  const cloudMultiplier = includeCloudBurst ? 2 : 1;

  const passivePerSecond =
    (state.serverLevel * 0.5 + state.autoCoderLevel * 0.3 + state.keyboardLevel * 0.18) *
    prestigeMultiplier *
    gitBonus *
    ciBonus *
    obsBonus *
    meta.passiveMultiplier *
    cloudMultiplier;

  const tapPower =
    (1 + state.autoCoderLevel * 0.5 + state.keyboardLevel * 0.08) *
    prestigeMultiplier *
    obsBonus *
    meta.tapMultiplier *
    cloudMultiplier;

  return {
    passivePerSecond,
    tapPower,
    incomeMultiplier:
      prestigeMultiplier *
      gitBonus *
      ciBonus *
      obsBonus *
      meta.passiveMultiplier *
      cloudMultiplier,
  };
};

const isMilestoneComplete = (state: GameState, milestone: MilestoneDefinition): boolean => {
  if (milestone.lifetimeTokens && state.lifetimeTokens < milestone.lifetimeTokens) {
    return false;
  }
  if (milestone.rebootCount && state.rebootCount < milestone.rebootCount) {
    return false;
  }
  return true;
};

const getPersistedState = (state: GameState) => {
  return {
    saveVersion: SAVE_VERSION,
    neuralTokens: state.neuralTokens,
    lifetimeTokens: state.lifetimeTokens,
    autoCoderLevel: state.autoCoderLevel,
    serverLevel: state.serverLevel,
    keyboardLevel: state.keyboardLevel,
    aiPairLevel: state.aiPairLevel,
    gitAutopilotLevel: state.gitAutopilotLevel,
    ciPipelineLevel: state.ciPipelineLevel,
    observabilityLevel: state.observabilityLevel,
    cloudBurstCooldown: state.cloudBurstCooldown,
    cloudBurstEndsAt: state.cloudBurstEndsAt,
    strainLevel: state.strainLevel,
    isBurnedOut: state.isBurnedOut,
    energyDrinks: state.energyDrinks,
    energyTechLevel: state.energyTechLevel,
    rebootCount: state.rebootCount,
    architecturePoints: state.architecturePoints,
    unlockedMetaNodes: state.unlockedMetaNodes,
    milestoneClaims: state.milestoneClaims,
  };
};

const persistSnapshot = async (state: GameState) => {
  const now = Date.now();
  if (now - lastPersistedAt < SAVE_THROTTLE_MS) return;
  const saveState = getPersistedState(state);
  await AsyncStorage.multiSet([
    [STORAGE_KEY_SAVE, JSON.stringify(saveState)],
    [STORAGE_KEY_LAST_ACTIVE, now.toString()],
  ]);
  lastPersistedAt = now;
};

const defaultState: GameState = {
  saveVersion: SAVE_VERSION,
  hasHydrated: false,
  hydrationStarted: false,

  neuralTokens: 0,
  lifetimeTokens: 0,
  locPerSecond: 0,
  tapPower: 1,
  incomeMultiplier: 1,

  autoCoderLevel: 0,
  serverLevel: 0,
  keyboardLevel: 0,
  aiPairLevel: 0,
  gitAutopilotLevel: 0,
  ciPipelineLevel: 0,
  observabilityLevel: 0,

  cloudBurstActive: false,
  cloudBurstCooldown: 0,
  cloudBurstEndsAt: 0,

  strainLevel: 0,
  isBurnedOut: false,
  activeSparks: [],

  energyDrinks: 0,
  energyTechLevel: 0,
  rebootCount: 0,

  architecturePoints: 0,
  unlockedMetaNodes: [],
  milestoneClaims: [],

  activeBonusWord: null,
  bonusWordExpiresAt: null,
  bonusWordPosition: null,

  activeNotification: null,

  lastTickTime: 0,
  offlineEarnedTokens: 0,
  offlineEarnedSeconds: 0,
};

const bootHydration = async (
  now: number,
  set: (partial: Partial<GameState>) => void,
  get: () => GameStore
) => {
  try {
    const [[, saveRaw], [, lastActiveRaw]] = await AsyncStorage.multiGet([
      STORAGE_KEY_SAVE,
      STORAGE_KEY_LAST_ACTIVE,
    ]);

    if (saveRaw) {
      const parsed = JSON.parse(saveRaw) as Partial<GameState>;
      set({
        ...parsed,
      });
    }

    const liveState = get();
    const lastActive = lastActiveRaw ? parseInt(lastActiveRaw, 10) : 0;
    const gapSeconds = lastActive
      ? Math.min(MAX_OFFLINE_SECONDS, (Date.now() - lastActive) / 1000)
      : 0;

    const effectiveBurstActive =
      liveState.cloudBurstEndsAt > 0 && now < liveState.cloudBurstEndsAt;
    const snapshot = buildIncomeSnapshot(
      { ...liveState, cloudBurstActive: effectiveBurstActive },
      effectiveBurstActive
    );
    const offlineEarned =
      gapSeconds > 5 ? snapshot.passivePerSecond * gapSeconds : 0;

    set({
      neuralTokens: liveState.neuralTokens + offlineEarned,
      lifetimeTokens: liveState.lifetimeTokens + offlineEarned,
      offlineEarnedTokens: offlineEarned,
      offlineEarnedSeconds: gapSeconds,
      locPerSecond: snapshot.passivePerSecond,
      tapPower: snapshot.tapPower,
      incomeMultiplier: snapshot.incomeMultiplier,
      cloudBurstActive: effectiveBurstActive,
      hasHydrated: true,
      hydrationStarted: false,
      lastTickTime: now,
    });

    await persistSnapshot(get());
  } catch {
    set({
      hasHydrated: true,
      hydrationStarted: false,
      lastTickTime: now,
    });
  }
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...defaultState,

  masterTick: (timestamp: number) => {
    const state = get();
    if (!state.hasHydrated) {
      if (!state.hydrationStarted) {
        set({ hydrationStarted: true });
        void bootHydration(timestamp, set, get);
      }
      return;
    }

    if (state.lastTickTime === 0) {
      set({ lastTickTime: timestamp });
      return;
    }

    const deltaSeconds = Math.max(0, Math.min(1.5, (timestamp - state.lastTickTime) / 1000));
    const meta = getMetaEffects(state);
    const burstStillActive = state.cloudBurstEndsAt > timestamp;
    const income = buildIncomeSnapshot(state, burstStillActive);
    const earnedTokens = income.passivePerSecond * deltaSeconds;

    let newStrain = gameMechanics.decayStrain(state.strainLevel, deltaSeconds);
    let newIsBurnedOut = state.isBurnedOut;
    let newSparks = state.activeSparks.filter((spark) => spark.expiresAt > timestamp);

    if (newIsBurnedOut && newStrain === 0) {
      newIsBurnedOut = false;
      newSparks.push({
        id: `consolation-${Math.random().toString(36).slice(2, 10)}`,
        x: 50,
        y: 50,
        value: gameMechanics.getSparkReward(state.neuralTokens, meta.sparkRewardMultiplier),
        expiresAt: timestamp + 10_000,
      });
    }

    if (newSparks.length < 3 && gameMechanics.rollForSpark(newStrain, deltaSeconds, meta.sparkChanceMultiplier)) {
      newSparks.push({
        id: Math.random().toString(36).slice(2, 10),
        x: Math.floor(Math.random() * 75) + 10,
        y: Math.floor(Math.random() * 75) + 10,
        value: gameMechanics.getSparkReward(state.neuralTokens, meta.sparkRewardMultiplier),
        expiresAt: timestamp + 8_000,
      });
    }

    let newBonusWord = state.activeBonusWord;
    let newBonusWordExpiresAt = state.bonusWordExpiresAt;
    let newBonusWordPosition = state.bonusWordPosition;
    if (newBonusWord && newBonusWordExpiresAt && timestamp > newBonusWordExpiresAt) {
      newBonusWord = null;
      newBonusWordExpiresAt = null;
      newBonusWordPosition = null;
    } else if (!newBonusWord && gameMechanics.rollForBonusWord(deltaSeconds)) {
      newBonusWord = BONUS_WORDS[Math.floor(Math.random() * BONUS_WORDS.length)];
      newBonusWordExpiresAt = timestamp + BONUS_WORD_DURATION;
      newBonusWordPosition = {
        x: Math.floor(Math.random() * 60) + 15,
        y: Math.floor(Math.random() * 60) + 15,
      };
    }

    set({
      neuralTokens: state.neuralTokens + earnedTokens,
      lifetimeTokens: state.lifetimeTokens + earnedTokens,
      locPerSecond: income.passivePerSecond,
      tapPower: income.tapPower,
      incomeMultiplier: income.incomeMultiplier,
      strainLevel: newStrain,
      isBurnedOut: newIsBurnedOut,
      activeSparks: newSparks,
      activeBonusWord: newBonusWord,
      bonusWordExpiresAt: newBonusWordExpiresAt,
      bonusWordPosition: newBonusWordPosition,
      cloudBurstActive: burstStillActive,
      lastTickTime: timestamp,
    });

    void persistSnapshot(get());
  },

  collectSpark: (id: string) => {
    const state = get();
    const spark = state.activeSparks.find((entry) => entry.id === id);
    if (!spark) return;
    set({
      energyDrinks: state.energyDrinks + spark.value,
      activeSparks: state.activeSparks.filter((entry) => entry.id !== id),
    });
    void persistSnapshot(get());
  },

  tapProgrammer: () => {
    const state = get();
    if (state.isBurnedOut || !state.hasHydrated) return;
    const meta = getMetaEffects(state);
    const burstStillActive = state.cloudBurstEndsAt > Date.now();
    const income = buildIncomeSnapshot(state, burstStillActive);
    const aiReduction = Math.max(0.2, 1 - state.aiPairLevel * 0.15);
    const strainMultiplier = aiReduction * meta.strainMultiplier;
    const newStrain = gameMechanics.getNewStrain(state.strainLevel, strainMultiplier);

    set({
      neuralTokens: state.neuralTokens + income.tapPower,
      lifetimeTokens: state.lifetimeTokens + income.tapPower,
      tapPower: income.tapPower,
      incomeMultiplier: income.incomeMultiplier,
      strainLevel: newStrain,
      isBurnedOut: gameMechanics.isBurnedOut(newStrain),
      cloudBurstActive: burstStillActive,
    });
    void persistSnapshot(get());
  },

  claimBonusWord: () => {
    const state = get();
    if (!state.activeBonusWord) return;
    const burstStillActive = state.cloudBurstEndsAt > Date.now();
    const income = buildIncomeSnapshot(state, burstStillActive);
    const bonus = Math.max(50, Math.floor(state.neuralTokens * 0.15)) * income.incomeMultiplier;
    set({
      neuralTokens: state.neuralTokens + bonus,
      lifetimeTokens: state.lifetimeTokens + bonus,
      activeBonusWord: null,
      bonusWordExpiresAt: null,
      bonusWordPosition: null,
    });
    void persistSnapshot(get());
  },

  triggerRandomBonusWord: () => {
    const word = BONUS_WORDS[Math.floor(Math.random() * BONUS_WORDS.length)];
    set({
      activeBonusWord: word,
      bonusWordExpiresAt: Date.now() + BONUS_WORD_DURATION,
      bonusWordPosition: {
        x: Math.floor(Math.random() * 60) + 15,
        y: Math.floor(Math.random() * 60) + 15,
      },
    });
  },

  purchaseUpgrade: (type) => {
    const state = get();
    const typed = type as UpgradeType;
    if (!isUpgradeUnlocked(state, typed)) return;
    const level = getUpgradeLevel(state, typed);
    const tierRequirement = getTierUnlockRequirement(Math.floor(level / 20) + 1);
    if (state.lifetimeTokens < tierRequirement) return;
    const meta = getMetaEffects(state);
    const cost = getUpgradeCost(level, {
      costMultiplier: getUpgradeCostMultiplier(typed),
      metaDiscount: meta.costDiscount,
    });
    if (state.neuralTokens < cost) return;

    const next = { neuralTokens: state.neuralTokens - cost } as Partial<GameState>;
    if (type === "autoCoder") next.autoCoderLevel = state.autoCoderLevel + 1;
    if (type === "server") next.serverLevel = state.serverLevel + 1;
    if (type === "keyboard") next.keyboardLevel = state.keyboardLevel + 1;
    set(next);
    void persistSnapshot(get());
  },

  purchaseHiddenUpgrade: (type) => {
    const state = get();
    const typed = type as UpgradeType;
    if (!isUpgradeUnlocked(state, typed)) return;
    const level = getUpgradeLevel(state, typed);
    const tierRequirement = getTierUnlockRequirement(Math.floor(level / 20) + 1);
    if (state.lifetimeTokens < tierRequirement) return;
    const meta = getMetaEffects(state);
    const cost = getUpgradeCost(level, {
      costMultiplier: getUpgradeCostMultiplier(typed),
      metaDiscount: meta.costDiscount,
    });
    if (state.neuralTokens < cost) return;

    const next = { neuralTokens: state.neuralTokens - cost } as Partial<GameState>;
    if (type === "aiPair") next.aiPairLevel = state.aiPairLevel + 1;
    if (type === "gitAutopilot") next.gitAutopilotLevel = state.gitAutopilotLevel + 1;
    if (type === "ciPipeline") next.ciPipelineLevel = state.ciPipelineLevel + 1;
    if (type === "observability") next.observabilityLevel = state.observabilityLevel + 1;
    set(next);
    void persistSnapshot(get());
  },

  activateCloudBurst: () => {
    const state = get();
    const now = Date.now();
    if (state.energyDrinks < 1) return;
    if (state.cloudBurstCooldown > now) return;

    const meta = getMetaEffects(state);
    const duration = CLOUD_BURST_DURATION + meta.cloudBurstDurationBonus;

    set({
      energyDrinks: state.energyDrinks - 1,
      cloudBurstActive: true,
      cloudBurstEndsAt: now + duration * 1000,
      cloudBurstCooldown: now + CLOUD_BURST_COOLDOWN * 1000,
    });
    void persistSnapshot(get());
  },

  purchaseEnergyUpgrade: () => {
    const state = get();
    if (state.energyTechLevel >= 20) return;
    const cost = getEnergyTechCost(state.energyTechLevel);
    if (state.energyDrinks < cost) return;
    set({
      energyDrinks: state.energyDrinks - cost,
      energyTechLevel: state.energyTechLevel + 1,
    });
    void persistSnapshot(get());
  },

  purchaseMetaNode: (nodeId: string) => {
    const state = get();
    const node = META_NODE_BY_ID[nodeId];
    if (!node) return;
    if (state.unlockedMetaNodes.includes(nodeId)) return;
    if (node.requires.some((parentId) => !state.unlockedMetaNodes.includes(parentId))) return;
    if (state.architecturePoints < node.cost) return;

    set({
      architecturePoints: state.architecturePoints - node.cost,
      unlockedMetaNodes: [...state.unlockedMetaNodes, nodeId],
      activeNotification: makeNotification("Meta Node Unlocked", `${node.title} activated`),
    });
    void persistSnapshot(get());
  },

  respecMetaTree: () => {
    const state = get();
    if (state.unlockedMetaNodes.length === 0) return;
    let refund = 0;
    state.unlockedMetaNodes.forEach((id) => {
      const node = META_NODE_BY_ID[id];
      if (node) refund += node.cost;
    });
    const penalty = Math.ceil(refund * 0.2);
    set({
      architecturePoints: Math.max(0, state.architecturePoints + refund - penalty),
      unlockedMetaNodes: [],
      activeNotification: makeNotification("Meta Tree Reset", `Refunded ${refund - penalty} AP`),
    });
    void persistSnapshot(get());
  },

  claimMilestone: (milestoneId: string) => {
    const state = get();
    if (state.milestoneClaims.includes(milestoneId)) return;
    const milestone = MILESTONES.find((entry) => entry.id === milestoneId);
    if (!milestone) return;
    if (!isMilestoneComplete(state, milestone)) return;

    const rewardTokens = milestone.rewardTokens ?? 0;
    const rewardEnergyDrinks = milestone.rewardEnergyDrinks ?? 0;
    const rewardArchitecturePoints = milestone.rewardArchitecturePoints ?? 0;

    set({
      neuralTokens: state.neuralTokens + rewardTokens,
      lifetimeTokens: state.lifetimeTokens + rewardTokens,
      energyDrinks: state.energyDrinks + rewardEnergyDrinks,
      architecturePoints: state.architecturePoints + rewardArchitecturePoints,
      milestoneClaims: [...state.milestoneClaims, milestoneId],
      activeNotification: makeNotification(
        `Milestone: ${milestone.title}`,
        `+${rewardTokens.toLocaleString()} LoC / +${rewardEnergyDrinks} cans / +${rewardArchitecturePoints} AP`
      ),
    });
    void persistSnapshot(get());
  },

  reboot: () => {
    const state = get();
    if (state.neuralTokens < REBOOT_THRESHOLD) return;

    const rebootBonusPoints = Math.max(
      1,
      Math.floor(Math.log10(Math.max(REBOOT_THRESHOLD, state.lifetimeTokens)) - 5)
    );
    const preservedMetaState = {
      architecturePoints: state.architecturePoints + rebootBonusPoints,
      unlockedMetaNodes: state.unlockedMetaNodes,
      milestoneClaims: state.milestoneClaims,
    };

    set({
      ...defaultState,
      hasHydrated: true,
      hydrationStarted: false,
      lastTickTime: Date.now(),
      energyTechLevel: state.energyTechLevel + 1,
      energyDrinks: Math.floor(state.energyDrinks * 0.5),
      rebootCount: state.rebootCount + 1,
      lifetimeTokens: state.lifetimeTokens,
      ...preservedMetaState,
      activeNotification: makeNotification("Reboot Complete", `+${rebootBonusPoints} Architecture Points`),
    });
    void persistSnapshot(get());
  },

  clearOfflineToast: () => {
    set({ offlineEarnedTokens: 0, offlineEarnedSeconds: 0 });
  },

  dismissNotification: () => {
    set({ activeNotification: null });
  },
}));

export {
  REBOOT_THRESHOLD,
  getEnergyTechCost,
  getUpgradeCostMultiplier,
  META_NODE_DEFINITIONS,
  MILESTONES,
  getTierUnlockRequirement,
};
