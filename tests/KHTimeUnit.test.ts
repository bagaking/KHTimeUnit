import { KHTimeUnit } from "../src/KHTimeUnit";

// 为测试创建一个扩展的 KHTimeUnit 类型，包含私有属性

describe("KHTimeUnit Edge Cases", () => {
  describe("Constructor Edge Cases", () => {
    it("should handle floating point numbers", () => {
      expect(() => new KHTimeUnit({ cc: 1.5 })).toThrow();
    });

    it("should handle negative numbers", () => {
      expect(() => new KHTimeUnit({ cc: -1 })).toThrow();
    });
  });

  describe("Time Range Operations", () => {
    it("should handle edge cases in range calculations", () => {
      const time = new KHTimeUnit("1cc");
      expect(time.isWithinRange(80)).toBe(true);
      expect(time.isWithinRange(100)).toBe(true);
      expect(time.isWithinRange(79)).toBe(false);
      expect(time.isWithinRange(101)).toBe(false);
    });
  });

  describe("Static Methods Edge Cases", () => {
    it("should handle zero values in static methods", () => {
      expect(KHTimeUnit.fromHours(0).toString()).toBe("");
      expect(KHTimeUnit.fromMinutes(0).toString()).toBe("");
      expect(KHTimeUnit.fromSeconds(0).toString()).toBe("");
    });
  });

  describe("Equals Zero Cases", () => {
    it("should handle zero equality correctly", () => {
      const zero1 = new KHTimeUnit(0);
      const zero2 = new KHTimeUnit({ cc: 0, pomo: 0, q: 0 });
      const nonZero = new KHTimeUnit("1q");

      // 测试零值相等性
      expect(zero1.equals(zero2)).toBe(true);
      expect(zero2.equals(zero1)).toBe(true);

      // 测试零值与非零值比较
      expect(zero1.equals(nonZero)).toBe(false);
      expect(nonZero.equals(zero1)).toBe(false);
    });
  });
});

describe("Getters", () => {
  it("should return correct values for getters", () => {
    const unit = new KHTimeUnit("2cc 3pomo 4q");
    expect(unit.cc).toBe(2);
    expect(unit.pomo).toBe(3);
    expect(unit.q).toBe(4);
  });

  it("should return zero for undefined units", () => {
    const unit = new KHTimeUnit({});
    expect(unit.cc).toBe(0);
    expect(unit.pomo).toBe(0);
    expect(unit.q).toBe(0);
  });
});

describe("Comparison Methods Edge Cases", () => {
  it("should handle equal duration comparisons", () => {
    const time1 = new KHTimeUnit("1cc"); // 90 minutes
    const time2 = new KHTimeUnit("3pomo"); // 90 minutes

    expect(time1.isLongerThan(time2)).toBe(false);
    expect(time1.isShorterThan(time2)).toBe(false);
  });

  it("should handle zero value comparisons", () => {
    const zero = new KHTimeUnit(0);
    const nonZero = new KHTimeUnit("1q"); // 15 minutes

    expect(zero.isLongerThan(nonZero)).toBe(false);
    expect(zero.isShorterThan(nonZero)).toBe(true);
    expect(nonZero.isLongerThan(zero)).toBe(true);
    expect(nonZero.isShorterThan(zero)).toBe(false);
  });

  it("should handle same unit type comparisons", () => {
    const time1 = new KHTimeUnit("2cc"); // 180 minutes
    const time2 = new KHTimeUnit("1cc"); // 90 minutes

    expect(time1.isLongerThan(time2)).toBe(true);
    expect(time1.isShorterThan(time2)).toBe(false);
    expect(time2.isLongerThan(time1)).toBe(false);
    expect(time2.isShorterThan(time1)).toBe(true);
  });

  it("should handle different unit type comparisons", () => {
    const time1 = new KHTimeUnit("1cc"); // 90 minutes
    const time2 = new KHTimeUnit("5q"); // 75 minutes

    expect(time1.isLongerThan(time2)).toBe(true);
    expect(time1.isShorterThan(time2)).toBe(false);
    expect(time2.isLongerThan(time1)).toBe(false);
    expect(time2.isShorterThan(time1)).toBe(true);
  });
});
