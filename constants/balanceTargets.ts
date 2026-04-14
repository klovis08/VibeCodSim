export const progressionTargets = {
  // Desired pacing windows used during balancing passes.
  firstAdvancedModuleSeconds: 120,
  firstCloudBurstSeconds: 900,
  firstRebootSeconds: 1800,
  firstMetaNodeSeconds: 2400,
};

export const balanceChecklist = [
  "Active play reaches first advanced unlock within 2-4 minutes",
  "Hybrid play reaches first reboot in under 30 minutes",
  "Passive play remains viable but slower than hybrid play",
  "Meta nodes meaningfully change pacing without trivializing milestones",
  "Tier gates are visible and understandable before they block upgrades",
];
