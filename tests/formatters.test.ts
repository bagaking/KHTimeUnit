import { formatTime } from "../src/formatters";

describe("Formatters", () => {
  describe("Format Options Validation", () => {
    it("should throw error for invalid format options", () => {
      expect(() => {
        formatTime({ cc: 1 }, 'CC"cc" :: invalid-option');
      }).toThrow("Invalid format option");
    });

    it("should handle empty options string", () => {
      expect(formatTime({ cc: 1 }, 'CC"cc" ::')).toBe("01cc");
    });
  });

  describe("Zero Value Handling", () => {
    it("should handle all zero values with hide-zero option", () => {
      expect(
        formatTime(
          { cc: 0, pomo: 0, q: 0 },
          'CC"cc" PP"pomo" QQ"q" :: hide-when-zero'
        )
      ).toBe("");
    });

    it("should handle partial zero values with hide-zero option", () => {
      expect(
        formatTime(
          { cc: 1, pomo: 0, q: 0 },
          'CC"cc" PP"pomo" QQ"q" :: hide-when-zero'
        )
      ).toBe("01cc");
    });
  });

  describe("Template Processing", () => {
    it("should handle custom templates with quotes", () => {
      expect(formatTime({ cc: 1 }, 'CC"hours" and PP"minutes"')).toBe(
        "01hours and 00minutes"
      );
    });

    it("should handle templates with multiple consecutive units", () => {
      expect(formatTime({ cc: 1 }, 'CCCC"cc"')).toBe("0001cc");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty format string", () => {
      expect(formatTime({ cc: 1 }, "")).toBe("");
      expect(formatTime({ cc: 1 }, " ")).toBe("");
      expect(formatTime({ cc: 1 }, "::")).toBe("");
    });

    it("should handle undefined and null format", () => {
      expect(formatTime({ cc: 1 })).toBe("1cc");
      // @ts-expect-error Testing null input
      expect(formatTime({ cc: 1 }, null)).toBe("1cc");
      expect(formatTime({ cc: 1 }, undefined)).toBe("1cc");
    });

    it("should handle malformed format strings", () => {
      expect(() => formatTime({ cc: 1 }, "::: invalid")).toThrow(
        "Invalid format"
      );
      expect(() => formatTime({ cc: 1 }, ":: ::")).toThrow("Invalid format");
    });
  });

  describe("Zero Value Edge Cases", () => {
    it("should handle zero with different format options", () => {
      const zero = { cc: 0, pomo: 0, q: 0 };

      // 默认格式
      expect(formatTime(zero)).toBe("");

      // 不隐藏零值
      expect(formatTime(zero, 'CC"cc" PP"pomo" QQ"q"')).toBe("00cc 00pomo 00q");

      // 隐藏零值但保留单位
      expect(formatTime(zero, 'CC"cc" PP"pomo" QQ"q" :: hide-when-zero')).toBe(
        ""
      );

      // 不补零
      expect(formatTime(zero, 'CC"cc" PP"pomo" QQ"q" :: no-pad-zero')).toBe(
        "0cc 0pomo 0q"
      );
    });

    it("should handle partial zero values", () => {
      const partial = { cc: 1, pomo: 0, q: 0 };

      // 隐藏零值
      expect(
        formatTime(partial, 'CC"cc" PP"pomo" QQ"q" :: hide-when-zero')
      ).toBe("01cc");

      // 不隐藏零值
      expect(formatTime(partial, 'CC"cc" PP"pomo" QQ"q"')).toBe(
        "01cc 00pomo 00q"
      );
    });
  });

  describe("Template Processing Edge Cases", () => {
    it("should handle templates with only quotes", () => {
      expect(formatTime({ pomo: 1 }, '""')).toBe("");
      expect(formatTime({ cc: 1 }, '" "')).toBe(" ");
      expect(formatTime({ cc: 1 }, '"cc"')).toBe("cc");
    });

    it("should handle templates with invalid placeholders", () => {
      expect(formatTime({ cc: 1 }, "XX")).toBe("XX");
      expect(formatTime({ cc: 1 }, 'XX"cc"')).toBe("XXcc");
      expect(formatTime({ cc: 1 }, "INVALID")).toBe("INVALID");
    });

    it("should handle mixed valid and invalid placeholders", () => {
      expect(formatTime({ cc: 1 }, 'CC"cc" XX"xx"')).toBe("01cc XXxx");
      expect(formatTime({ cc: 1 }, 'CC"cc" INVALID"invalid"')).toBe(
        "01cc INVALIDinvalid"
      );
    });
  });

  describe("Format Option Combinations", () => {
    it("should handle multiple format options", () => {
      const unit = { cc: 1, pomo: 0 };
      expect(
        formatTime(unit, 'CC"cc" PP"pomo" :: hide-when-zero no-pad-zero')
      ).toBe("1cc");
    });

    it("should handle conflicting format options", () => {
      const unit = { cc: 0, pomo: 0 };
      // hide-when-zero 优先级高于 no-pad-zero
      expect(
        formatTime(unit, 'CC"cc" PP"pomo" :: hide-when-zero no-pad-zero')
      ).toBe("");
    });
  });

  describe("Formatters Edge Cases", () => {
    describe("Format string parsing", () => {
      it("should handle malformed format strings with multiple colons", () => {
        // 测试第 56 行: 处理格式字符串中有多个 :: 的情况
        expect(() =>
          formatTime({ cc: 1 }, "template :: option1 :: option2")
        ).toThrow("Invalid format");
        expect(() => formatTime({ cc: 1 }, ":: :: ::")).toThrow(
          "Invalid format"
        );
      });

      it("should handle format strings with only colons", () => {
        // 测试第 84 行: 处理只有冒号的格式字符串
        expect(formatTime({ cc: 1 }, ":")).toBe(":");
        expect(() => formatTime({ cc: 1 }, ":::")).toThrow("Invalid format");
      });
    });

    describe("Template value replacement", () => {
      it("should handle invalid template patterns", () => {
        // 测试第 130 行: 处理无效的模板模式
        expect(formatTime({ cc: 1 }, "INVALID")).toBe("INVALID");
        expect(formatTime({ cc: 1 }, "XX")).toBe("XX");
        expect(formatTime({ cc: 1 }, "CCCC")).toBe("0001");
      });

      it("should handle mixed valid and invalid patterns", () => {
        expect(formatTime({ cc: 1 }, 'CC"cc" INVALID"text"')).toBe(
          "01cc INVALIDtext"
        );
        expect(formatTime({ cc: 1 }, 'XXXX"cc" CC"valid"')).toBe(
          "XXXXcc 01valid"
        );
      });
    });

    describe("Complex edge cases", () => {
      it("should handle format strings with special characters", () => {
        expect(formatTime({ cc: 1 }, 'CC"$"PP"@"QQ"#"')).toBe("01$00@00#");
        expect(formatTime({ cc: 1 }, 'CC"\\""PP"\'"')).toBe("01\\PP'\"");
      });

      it("should handle format strings with unicode characters", () => {
        expect(formatTime({ cc: 1 }, 'CC"时间"PP"分钟"')).toBe("01时间00分钟");
        expect(formatTime({ cc: 1 }, 'CC"🕒"PP"⏰"')).toBe("01🕒00⏰");
      });

      it("should handle format strings with multiple spaces", () => {
        expect(formatTime({ cc: 1 }, 'CC"  "PP"  "')).toBe("01  00  ");
        expect(formatTime({ cc: 1 }, "CC    PP")).toBe("01    00");
      });
    });

    describe("Option combination edge cases", () => {
      it("should handle multiple format options with spaces", () => {
        expect(
          formatTime({ cc: 0 }, 'CC"cc" ::   hide-when-zero   no-pad-zero  ')
        ).toBe("");
        expect(formatTime({ cc: 1 }, 'CC"cc" ::   no-pad-zero   ')).toBe("1cc");
      });

      it("should handle format options with mixed case", () => {
        // 这个应该抛出错误，因为选项是大小写敏感的
        expect(() => formatTime({ cc: 1 }, 'CC"cc" :: NO-PAD-ZERO')).toThrow(
          'Invalid format option: "NO-PAD-ZERO"'
        );
      });
    });
  });
});
