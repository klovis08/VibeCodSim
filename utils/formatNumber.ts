/**
 * Formats a large number into a human-readable abbreviated string.
 * Prevents layout overflow in the TokenDisplay and UpgradeCard components.
 *
 * Examples:
 *   999       → "999"
 *   1500      → "1.50K"
 *   1_200_000 → "1.20M"
 *   1e9       → "1.00B"
 *   1e12      → "1.00T"
 *   1e15      → "1.00Qa"
 */
const SUFFIXES: [number, string][] = [
  [1e15, "Qa"],
  [1e12, "T"],
  [1e9,  "B"],
  [1e6,  "M"],
  [1e3,  "K"],
];

export const formatNumber = (n: number): string => {
  if (!isFinite(n) || isNaN(n)) return "0";

  const abs = Math.abs(n);

  for (const [threshold, suffix] of SUFFIXES) {
    if (abs >= threshold) {
      return (n / threshold).toFixed(2) + suffix;
    }
  }

  if (abs < 10) return n.toFixed(2);
  if (abs < 1000) return Number.isInteger(n) ? n.toString() : n.toFixed(1);
  return Math.floor(n).toString();
};
