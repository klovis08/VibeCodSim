import { gameMechanics } from "../utils/mechanics";

describe("gameMechanics", () => {
  describe("getNewStrain", () => {
    it("increases strain from 0", () => {
      const result = gameMechanics.getNewStrain(0);
      expect(result).toBeGreaterThan(0);
    });

    it("caps at maxStrain", () => {
      const result = gameMechanics.getNewStrain(99.5);
      expect(result).toBeLessThanOrEqual(gameMechanics.maxStrain);
    });

    it("applies multiplier", () => {
      const normal = gameMechanics.getNewStrain(50, 1);
      const reduced = gameMechanics.getNewStrain(50, 0.5);
      expect(reduced).toBeLessThan(normal);
    });

    it("enforces minimum multiplier of 0.05", () => {
      const minimal = gameMechanics.getNewStrain(50, 0);
      const expected = gameMechanics.getNewStrain(50, 0.05);
      expect(minimal).toBe(expected);
    });
  });

  describe("decayStrain", () => {
    it("reduces strain over time", () => {
      const result = gameMechanics.decayStrain(50, 1);
      expect(result).toBeLessThan(50);
    });

    it("never goes below 0", () => {
      const result = gameMechanics.decayStrain(1, 10);
      expect(result).toBe(0);
    });

    it("decays nothing in 0 time", () => {
      const result = gameMechanics.decayStrain(50, 0);
      expect(result).toBe(50);
    });
  });

  describe("isBurnedOut", () => {
    it("returns false below threshold", () => {
      expect(gameMechanics.isBurnedOut(99)).toBe(false);
    });

    it("returns true at max", () => {
      expect(gameMechanics.isBurnedOut(100)).toBe(true);
    });
  });

  describe("getSparkReward", () => {
    it("returns at least 150", () => {
      expect(gameMechanics.getSparkReward(0)).toBeGreaterThanOrEqual(150);
      expect(gameMechanics.getSparkReward(100)).toBeGreaterThanOrEqual(150);
    });

    it("scales with tokens", () => {
      const low = gameMechanics.getSparkReward(1000);
      const high = gameMechanics.getSparkReward(100_000);
      expect(high).toBeGreaterThan(low);
    });

    it("applies reward multiplier", () => {
      const base = gameMechanics.getSparkReward(10_000, 1);
      const boosted = gameMechanics.getSparkReward(10_000, 1.3);
      expect(boosted).toBeGreaterThan(base);
    });
  });

  describe("rollForSpark", () => {
    it("returns a boolean", () => {
      const result = gameMechanics.rollForSpark(50, 0.016);
      expect(typeof result).toBe("boolean");
    });
  });

  describe("rollForBonusWord", () => {
    it("returns a boolean", () => {
      const result = gameMechanics.rollForBonusWord(0.016);
      expect(typeof result).toBe("boolean");
    });
  });
});
