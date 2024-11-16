import { KHTimeUnit } from "../src/KHTimeUnit";
import { FORMAT_TEMPLATES } from "../src/constants";

describe("KHTimeUnit Formatting", () => {
  // 1cc = 80-100分钟，avg 90分钟
  // 1pomo = 20-40分钟，avg 30分钟
  // 1q = 10-20分钟，avg 15分钟
  // 总计：110-160分钟，avg 135分钟 = 02小时15分钟
  const unit = new KHTimeUnit("1cc 1pomo 1q");

  test.each([
    // KH格式：按单位直接显示，不补零
    [FORMAT_TEMPLATES.KH, "1cc 1pomo 1q"],
    // 人类可读格式：默认补零
    [FORMAT_TEMPLATES.HUMAN, "02小时 15分钟"],
    // 标准时间格式：默认补零
    [FORMAT_TEMPLATES.STANDARD, "02:15:00"],
    // 简单格式：不补零
    [FORMAT_TEMPLATES.SIMPLE, "2h 15m"],
    // 完整格式：不补零，使用复数
    [FORMAT_TEMPLATES.FULL, "02 hours 15 minutes"],
  ])("formats correctly with %s template", (format, expected) => {
    expect(unit.toString(format)).toBe(expected);
  });

  describe("Custom formats", () => {
    // 1cc = 90分钟
    // 1pomo = 30分钟
    // 总计：120分钟 = 02小时
    const unit = new KHTimeUnit({ cc: 1, pomo: 1 });

    test.each([
      // 2小时 = 02h（默认补零）
      ['HH"h"', "02h"],
      // 2小时 = 2h（指定不补零）
      ['HH"h" :: no-pad-zero', "2h"],
      // 2小时 = 2 hours，0分钟 = 0min（不需要复数）
      ['HH"hours" MM"min" :: no-pad-zero', "2hours 0min"],
      // 2小时0分 = 02:00（默认补零）
      ['HH":" MM', "02: 00"],
      // 2小时0分0秒 = 02:00:00（通过模板控制显示秒）
      ['HH":" MM:SS', "02: 00:00"],
      // 直接显示单位数：1cc 1p（不补零）
      ['CC"cc" PP"p" :: hide-when-zero no-pad-zero', "1cc 1p"],
      // 使用中文单位：01大段 01中段（默认补零）
      ['CC"大段" PP"中段" QQ"小段" :: hide-when-zero', "01大段 01中段"],
      // 显示所有单位（默认补零）
      ['HH"时"MM"分"', "02时00分"],
      // 显示时分秒（通过模板控制）
      ['HH"时"MM"分"SS"秒"', "02时00分00秒"],
    ])("formats %s correctly", (format, expected) => {
      expect(unit.toString(format)).toBe(expected);
    });
  });

  describe("Zero handling", () => {
    const zero = new KHTimeUnit({});

    test.each([
      // KH格式：显示最小单位，不补零
      [FORMAT_TEMPLATES.KH, ""],
      // 人类可读格式：全部补零
      [FORMAT_TEMPLATES.HUMAN, "00小时 00分钟"],
      // 标准时间格式：包含秒（由模板控制）
      [FORMAT_TEMPLATES.STANDARD, "00:00:00"],
      // 简单格式：显示最小单位，不补零
      [FORMAT_TEMPLATES.SIMPLE, ""],
      // 完整格式：使用复数形式，不补零
      [FORMAT_TEMPLATES.FULL, ""],
      // 隐藏零值，只显示最小单位
      ['HH"h"MM"m" :: hide-when-zero', ""],
      // 显示所有单位（默认补零）
      ['HH"时"MM"分"', "00时00分"],
      // 显示所有单位（指定不补零）
      ['HH"时"MM"分"', "00时00分"],
      // 显示时分秒（由模板控制）
      ['HH"时"MM"分"SS"秒"', "00时00分00秒"],
    ])("handles zero with %s format", (format, expected) => {
      expect(zero.toString(format)).toBe(expected);
    });
  });

  describe("Edge cases", () => {
    test("handles single units", () => {
      const cases = [
        // 1cc = 90分钟 = 01小时30分钟（默认补零）
        { input: { cc: 1 }, expected: "01 hours 30 minutes" },
        // 1pomo = 30分钟
        { input: { pomo: 1 }, expected: "30 minutes" },
        // 1q = 15分钟
        { input: { q: 1 }, expected: "15 minutes" },
      ];

      cases.forEach(({ input, expected }) => {
        const unit = new KHTimeUnit(input);
        expect(unit.toString(FORMAT_TEMPLATES.FULL)).toBe(expected);
      });
    });

    test("handles large numbers", () => {
      // 10cc = 10 * 90 = 900分钟
      // 5pomo = 5 * 30 = 150分钟
      // 3q = 3 * 15 = 45分钟
      // 总计：1095分钟 = 18小时15分钟
      const large = new KHTimeUnit({ cc: 10, pomo: 5, q: 3 });
      // 默认补零
      expect(large.toString(FORMAT_TEMPLATES.STANDARD)).toBe("18:15:00");
      // 不补零（因为 FULL 模板指定了 no-pad-zero）
      expect(large.toString(FORMAT_TEMPLATES.FULL)).toBe("18 hours 15 minutes");
      // 测试默认补零
      expect(large.toString('HH":" MM')).toBe("18: 15");
      expect(large.toString("HHH:MM")).toBe("018:15");

      // 测试明确指定不补零
      expect(large.toString('HH":" MMM :: no-pad-zero')).toBe("18: 15");
    });

    test("handles nil format", () => {
      const unit = new KHTimeUnit({ cc: 1 });
      // 空格式应该使用默认单位
      expect(unit.toString()).toBe("1cc");
    });

    test("handles empty string format", () => {
      const unit = new KHTimeUnit({ cc: 1 });
      // 空格式应该使用默认单位
      expect(unit.toString("")).toBe("");
    });

    test("handles invalid format", () => {
      const unit = new KHTimeUnit({ cc: 1 });
      // 无效的格式输出原始字符串，但会进行单位替换
      expect(unit.toString('XX"invalid"')).toBe("XXinvalid");
      expect(unit.toString('XX"invalid" :: no-pad-zero')).toBe("XXinvalid");
    });

    test("handles format with only options", () => {
      const unit = new KHTimeUnit({ cc: 1 });
      // 只有选项的格式应该使用默认单位
      expect(unit.toString(":: no-pad-zero")).toBe("");
    });
  });

  describe("Formatter edge cases", () => {
    test("handles undefined format", () => {
      const unit = new KHTimeUnit("1cc");
      expect(unit.toString(undefined)).toBe("1cc");
    });

    test("handles null format", () => {
      const unit = new KHTimeUnit("1cc");
      // @ts-expect-error Testing null input
      expect(unit.toString(null)).toBe("1cc");
    });

    test("handles invalid format options", () => {
      const unit = new KHTimeUnit("1cc");
      expect(() => unit.toString(":: invalid-option")).toThrow(
        'Invalid format option: "invalid-option"'
      );
      expect(() => unit.toString('HH":" MM :: invalid-option')).toThrow(
        'Invalid format option: "invalid-option"'
      );
    });

    test("handles empty format parts", () => {
      const unit = new KHTimeUnit("1cc");
      expect(unit.toString('""')).toBe("");
      expect(unit.toString('" "')).toBe(" ");
    });
  });
});
