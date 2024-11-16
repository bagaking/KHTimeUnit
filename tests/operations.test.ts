import { KHTimeUnit } from "../src/KHTimeUnit";

describe("KHTimeUnit Operations", () => {
  const unit1 = new KHTimeUnit({ q: 1, pomo: 1, cc: 1 });
  const unit2 = new KHTimeUnit({ q: 2, pomo: 2, cc: 2 });

  describe("Addition", () => {
    test("adds units correctly", () => {
      const result = unit1.add(unit2);
      expect(result.toMinutes()).toBe(unit1.toMinutes() + unit2.toMinutes());
    });

    test("handles zero values", () => {
      const zero = new KHTimeUnit({});
      expect(unit1.add(zero).equals(unit1)).toBe(true);
    });

    test("is commutative", () => {
      expect(unit1.add(unit2).equals(unit2.add(unit1))).toBe(true);
    });
  });

  describe("Subtraction", () => {
    test("subtracts units correctly", () => {
      const result = unit2.subtract(unit1);
      expect(result.toMinutes()).toBe(unit2.toMinutes() - unit1.toMinutes());
    });

    test("handles zero values", () => {
      const zero = new KHTimeUnit({});
      expect(unit1.subtract(zero).equals(unit1)).toBe(true);
    });

    test("handles negative results", () => {
      expect(() => unit1.subtract(unit2)).not.toThrow();
    });
  });

  describe("Comparison", () => {
    test("equals works correctly", () => {
      // 相同单位组合应该相等
      const unit3 = new KHTimeUnit({ q: 1, pomo: 1, cc: 1 });
      expect(unit1.equals(unit3)).toBe(true);

      // 不同单位但时间范围重叠应该相等
      expect(new KHTimeUnit("2pomo").equals(new KHTimeUnit("1cc"))).toBe(true);
      expect(new KHTimeUnit("6q").equals(new KHTimeUnit("1cc"))).toBe(true);

      // 时间范围不重叠应该不相等
      expect(new KHTimeUnit("1q").equals(new KHTimeUnit("1cc"))).toBe(false);
      expect(unit1.equals(unit2)).toBe(false);
    });
  });

  describe("scale", () => {
    test("scales time correctly", () => {
      const unit = new KHTimeUnit("1cc"); // 90分钟
      expect(unit.scale(2).equals(new KHTimeUnit("2cc"))).toBe(true);
      expect(unit.scale(0.5).equals(new KHTimeUnit("3q"))).toBe(true);
      expect(unit.scale(0).equals(new KHTimeUnit("0cc"))).toBe(true);
    });

    test("handles rounding", () => {
      const unit = new KHTimeUnit("1q"); // 15分钟
      expect(unit.scale(2).equals(new KHTimeUnit("2q"))).toBe(true);
      expect(unit.scale(2).equals(new KHTimeUnit("1pomo"))).toBe(true);
      expect(unit.scale(1.4).equals(new KHTimeUnit("1q"))).toBe(true);
      expect(unit.scale(1.6).equals(new KHTimeUnit("1q"))).toBe(true);
    });
  });

  describe("clone", () => {
    test("creates independent copy", () => {
      const original = new KHTimeUnit("1cc 2pomo 3q");
      const clone = original.clone();

      // 验证值相同
      expect(clone.toString()).toBe(original.toString());

      // 验证是独立的副本
      const modified = clone.add(new KHTimeUnit("1cc"));
      expect(modified.toString()).not.toBe(original.toString());
      expect(original.toString()).toBe("1cc 2pomo 3q");
    });
  });

  describe("equals", () => {
    test("compares time ranges correctly", () => {
      // Same units should be equal
      expect(new KHTimeUnit("1cc").equals(new KHTimeUnit("1cc"))).toBe(true);

      // Different units with overlapping ranges should be equal
      expect(new KHTimeUnit("3pomo").equals(new KHTimeUnit("1cc"))).toBe(true);
      expect(new KHTimeUnit("8q").equals(new KHTimeUnit("1cc"))).toBe(true);

      // Different units with non-overlapping ranges should not be equal
      expect(new KHTimeUnit("1q").equals(new KHTimeUnit("1cc"))).toBe(false);
      expect(new KHTimeUnit("1pomo").equals(new KHTimeUnit("1cc"))).toBe(false);
    });
  });
});
