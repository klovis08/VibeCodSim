import { formatNumber } from "../utils/formatNumber";

describe("formatNumber", () => {
  it("returns '0' for NaN/Infinity", () => {
    expect(formatNumber(NaN)).toBe("0");
    expect(formatNumber(Infinity)).toBe("0");
    expect(formatNumber(-Infinity)).toBe("0");
  });

  it("shows two decimals for values < 10", () => {
    expect(formatNumber(0)).toBe("0.00");
    expect(formatNumber(0.5)).toBe("0.50");
    expect(formatNumber(3.14)).toBe("3.14");
    expect(formatNumber(9.99)).toBe("9.99");
  });

  it("shows no decimal for integers 10-999", () => {
    expect(formatNumber(10)).toBe("10");
    expect(formatNumber(500)).toBe("500");
    expect(formatNumber(999)).toBe("999");
  });

  it("shows one decimal for non-integer values 10-999", () => {
    expect(formatNumber(10.5)).toBe("10.5");
    expect(formatNumber(999.9)).toBe("999.9");
  });

  it("abbreviates thousands", () => {
    expect(formatNumber(1500)).toBe("1.50K");
    expect(formatNumber(10_000)).toBe("10.00K");
  });

  it("abbreviates millions", () => {
    expect(formatNumber(1_200_000)).toBe("1.20M");
  });

  it("abbreviates billions", () => {
    expect(formatNumber(1e9)).toBe("1.00B");
  });

  it("abbreviates trillions", () => {
    expect(formatNumber(1e12)).toBe("1.00T");
  });

  it("abbreviates quadrillions", () => {
    expect(formatNumber(1e15)).toBe("1.00Qa");
  });
});
