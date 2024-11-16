import { KHTimeUnit } from "../src/KHTimeUnit";

describe("KHTimeUnit Static Methods", () => {
  describe("sumRange", () => {
    test("calculates sum range correctly", () => {
      const units = [
        new KHTimeUnit("1cc"), // 80-100 min
        new KHTimeUnit("1pomo"), // 20-40 min
        new KHTimeUnit("1q"), // 10-20 min
      ];

      const range = KHTimeUnit.sumRange(units);
      expect(range.min).toBe(110); // 80 + 20 + 10
      expect(range.max).toBe(160); // 100 + 40 + 20
      expect(range.average).toBe(135); // 90 + 30 + 15
    });

    test("handles empty array", () => {
      const range = KHTimeUnit.sumRange([]);
      expect(range.min).toBe(0);
      expect(range.max).toBe(0);
      expect(range.average).toBe(0);
    });

    test("handles single unit", () => {
      const range = KHTimeUnit.sumRange([new KHTimeUnit("1cc")]);
      expect(range.min).toBe(80);
      expect(range.max).toBe(100);
      expect(range.average).toBe(90);
    });
  });

  describe("estimateFromMinutes", () => {
    test("provides all estimation options", () => {
      const minutes = 150; // 2.5 hours
      const estimate = KHTimeUnit.estimateFromMinutes(minutes);

      // 验证最小估算（使用最大单位值）
      const minRange = estimate.asMinimal.getTimeRange();
      expect(minRange.min).toBeLessThanOrEqual(minutes);
      expect(minRange.max).toBeGreaterThanOrEqual(minutes);

      // 验证最大估算（使用最小单位值）
      const maxRange = estimate.asMaximal.getTimeRange();
      expect(maxRange.min).toBeLessThanOrEqual(minutes);
      expect(maxRange.max).toBeGreaterThanOrEqual(minutes);

      // 验证平均值估算
      expect(
        Math.abs(estimate.asAverage.toMinutes() - minutes)
      ).toBeLessThanOrEqual(15);
    });

    test("handles edge cases", () => {
      // 测试零分钟
      const zeroEstimate = KHTimeUnit.estimateFromMinutes(0);
      expect(zeroEstimate.asMinimal.toMinutes()).toBe(0);
      expect(zeroEstimate.asMaximal.toMinutes()).toBe(0);
      expect(zeroEstimate.asAverage.toMinutes()).toBe(0);

      // 测试小于最小单位的时间
      const smallEstimate = KHTimeUnit.estimateFromMinutes(5);
      expect(smallEstimate.asMinimal.q).toBe(1);
      expect(smallEstimate.asMaximal.q).toBe(1);
    });

    // test("provides reasonable estimates", () => {
    //   const estimate = KHTimeUnit.estimateFromMinutes(150);
    //   console.log({
    //     asMinimal: {
    //       units: estimate.asMinimal.toString(),
    //       range: estimate.asMinimal.getTimeRange(),
    //     },
    //     asMaximal: {
    //       units: estimate.asMaximal.toString(),
    //       range: estimate.asMaximal.getTimeRange(),
    //     },
    //     asAverage: {
    //       units: estimate.asAverage.toString(),
    //       minutes: estimate.asAverage.toMinutes(),
    //     },
    //   });
    // });
  });

  describe("Factory methods", () => {
    test("fromHours creates correct unit", () => {
      const unit = KHTimeUnit.fromHours(2.5);
      expect(unit.toMinutes()).toBe(150);
    });

    test("fromSeconds creates correct unit", () => {
      const unit = KHTimeUnit.fromSeconds(9000); // 2.5 hours
      expect(unit.toMinutes()).toBe(150);
    });

    test("fromMinutes creates correct unit", () => {
      const unit = KHTimeUnit.fromMinutes(150);
      expect(unit.toMinutes()).toBe(150);
    });
  });
});
