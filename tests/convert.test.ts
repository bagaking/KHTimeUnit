import { KHTimeUnit } from "../src/KHTimeUnit";

describe("KHTimeUnit", () => {
  describe("Constructor", () => {
    test("creates from KHTimeUnitInput", () => {
      const unit = new KHTimeUnit({ q: 1, pomo: 1, cc: 1 });
      expect(unit.toMinutes()).toBe(135); // 90 + 30 + 15
    });

    test("creates from minutes", () => {
      const unit = new KHTimeUnit(135);
      expect(unit.toString()).toBe("1cc 1pomo 1q");
    });

    test("creates from string", () => {
      const unit = new KHTimeUnit("1cc 1pomo 1q");
      expect(unit.toMinutes()).toBe(135);
    });

    test("handles empty input", () => {
      const unit = new KHTimeUnit({});
      expect(unit.toString()).toBe("");
    });
  });

  describe("Validation", () => {
    test("rejects negative direct input", () => {
      expect(() => new KHTimeUnit({ q: -1 })).toThrow("negative");
      expect(() => new KHTimeUnit({ pomo: -1 })).toThrow("negative");
      expect(() => new KHTimeUnit({ cc: -1 })).toThrow("negative");
    });

    test("rejects non-integer values", () => {
      expect(() => new KHTimeUnit({ q: 1.5 })).toThrow("integers");
      expect(() => new KHTimeUnit({ pomo: 1.5 })).toThrow("integers");
      expect(() => new KHTimeUnit({ cc: 1.5 })).toThrow("integers");
    });
  });

  describe("Conversion methods", () => {
    const unit = new KHTimeUnit({ q: 1, pomo: 1, cc: 1 });

    test("converts to hours", () => {
      expect(unit.toHours()).toBe(2.25); // 135/60
    });

    test("converts to minutes", () => {
      expect(unit.toMinutes()).toBe(135);
    });

    test("converts to seconds", () => {
      expect(unit.toSeconds()).toBe(8100);
    });
  });

  describe("String parsing", () => {
    test("parses valid string input", () => {
      const unit = new KHTimeUnit("1cc 2pomo 3q");
      expect(unit.toString()).toBe("1cc 2pomo 3q");
    });

    test("parses string with different order", () => {
      const unit = new KHTimeUnit("3q 1cc 2pomo");
      expect(unit.toString()).toBe("1cc 2pomo 3q");
    });

    test("handles extra spaces", () => {
      const unit = new KHTimeUnit("  1cc   2pomo   3q  ");
      expect(unit.toString()).toBe("1cc 2pomo 3q");
    });

    test("rejects invalid format", () => {
      expect(() => new KHTimeUnit("1cc 2invalid")).toThrow("Invalid format");
      expect(() => new KHTimeUnit("1.5cc")).toThrow("Invalid format");
      expect(() => new KHTimeUnit("cc")).toThrow("Invalid format");
    });
  });

  describe("Time ranges", () => {
    test("calculates correct range", () => {
      const unit = new KHTimeUnit("1cc 1pomo 1q");
      const range = unit.getTimeRange();
      expect(range.min).toBe(110); // 80 + 20 + 10
      expect(range.max).toBe(160); // 100 + 40 + 20
    });

    test("handles zero values", () => {
      const unit = new KHTimeUnit({});
      const range = unit.getTimeRange();
      expect(range.min).toBe(0);
      expect(range.max).toBe(0);
    });
  });

  describe("Error handling", () => {
    test("handles invalid time unit combinations", () => {
      expect(() => {
        new KHTimeUnit("invalid");
      }).toThrow("Invalid format");

      expect(() => {
        new KHTimeUnit("cc1");
      }).toThrow("Invalid format");

      expect(() => {
        new KHTimeUnit("-1cc");
      }).toThrow("Invalid format");
    });

    test("handles edge cases in time conversion", () => {
      const unit = new KHTimeUnit(Number.MAX_SAFE_INTEGER);
      expect(unit.toMinutes()).toBeGreaterThan(0);

      const zero = new KHTimeUnit(0);
      expect(zero.toMinutes()).toBe(0);
      expect(zero.toString()).toBe("");
    });
  });
});
