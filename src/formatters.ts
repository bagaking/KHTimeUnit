import {
  FORMAT_OPTIONS,
  FORMAT_TEMPLATES,
  FormatTemplate,
  TIME_RANGES,
  FormatOption,
} from "./constants";
import { KHTimeUnitInput } from "./KHTimeUnit";

/**
 * Interface for time value mapping
 * Supports both KH time units (CC, PP, QQ) and standard time units (HH, MM, SS)
 */
interface TimeValues {
  /** Number of CC units (60-120 minutes each) */
  CC: number;
  /** Number of POMO units (20-40 minutes each) */
  PP: number;
  /** Number of Q units (10-20 minutes each) */
  QQ: number;
  /** Hours (00-99) */
  HH: number;
  /** Minutes (00-59) */
  MM: number;
  /** Seconds (00-59) */
  SS: number;
}

/**
 * Interface for parsed format configuration
 */
interface ParsedFormat {
  template: string;
  options: Set<FormatOption>;
}

/**
 * Validates if the given option is a valid format option
 */
function isValidFormatOption(option: string): option is FormatOption {
  return Object.values(FORMAT_OPTIONS).includes(option as FormatOption);
}

/**
 * Parses format string into template and options
 * Format pattern: 'TEMPLATE :: OPTION1 OPTION2 ...'
 *
 * @example
 * parseFormat('HH:MM :: pad-zero hide-when-zero')
 * // Returns: { template: 'HH:MM', options: Set(['pad-zero', 'hide-when-zero']) }
 *
 * @throws {Error} If any format option is invalid
 */
function parseFormat(format: string | FormatTemplate): ParsedFormat {
  const parts = (format || "").split("::");
  if (parts.length > 2) {
    throw new Error("Invalid format");
  }
  let [template, optionsStr] = parts;
  template = template.trim();
  optionsStr = optionsStr?.trim();

  // Parse and validate options
  const options = new Set<FormatOption>();
  if (optionsStr) {
    const optionsList = optionsStr.split(" ").filter(Boolean); // Remove empty strings

    for (const option of optionsList) {
      if (!isValidFormatOption(option)) {
        throw new Error(
          `Invalid format option: "${option}". Valid options are: ${Object.values(
            FORMAT_OPTIONS
          ).join(", ")}`
        );
      }
      options.add(option);
    }
  }

  return { template, options };
}

/**
 * Converts KHTimeUnit input to total minutes
 */
export function toMinutes(units: KHTimeUnitInput): number {
  return (
    (units.cc ?? 0) * TIME_RANGES.CC.avg +
    (units.pomo ?? 0) * TIME_RANGES.POMO.avg +
    (units.q ?? 0) * TIME_RANGES.Q.avg
  );
}

/**
 * Converts minutes to KHTimeUnit input
 */
export function fromMinutes(minutes: number): KHTimeUnitInput {
  const cc = Math.floor(minutes / TIME_RANGES.CC.avg);
  const remainingAfterCC = minutes % TIME_RANGES.CC.avg;
  const pomo = Math.floor(remainingAfterCC / TIME_RANGES.POMO.avg);
  const remainingAfterPomo = remainingAfterCC % TIME_RANGES.POMO.avg;
  const q = Math.floor(remainingAfterPomo / TIME_RANGES.Q.avg);

  return { cc, pomo, q };
}

/**
 * Gets the padding length based on the consecutive occurrences of the key in the template
 * @param template The format template
 * @param key The key to look for
 * @returns The number of consecutive occurrences of the key
 */
function getPaddingLength(template: string, key: string): number {
  const match = template.match(new RegExp(`${key}+`));
  return match ? match[0].length : 1;
}

/**
 * Calculates all time values from KHTimeUnit input
 * @param units KHTimeUnit input values
 * @returns Object containing all time unit values
 */
function calculateTimeValues(units: KHTimeUnitInput): TimeValues {
  // Calculate total minutes first
  const totalMinutes = toMinutes(units);

  // Calculate hours, minutes and seconds
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.floor((totalMinutes % 1) * 60);

  return {
    // KH time units (use original values)
    CC: units.cc ?? 0,
    PP: units.pomo ?? 0,
    QQ: units.q ?? 0,

    // Standard time units
    HH: hours,
    MM: minutes,
    SS: seconds,
  };
}

/**
 * Remove zero value and its unit from the template string
 * Handles both quoted and unquoted formats
 * @param template The template string
 * @param key The key to remove (e.g., 'CC', 'PP', 'QQ')
 * @returns Template string with zero value removed
 */
function removeZeroValue(template: string, key: string): string {
  // Remove pattern with quotes: e.g., '0"cc"' or '00"cc"'
  let result = template.replace(new RegExp(`${key}+\\s*"[^"]*"`), "");

  // Remove pattern without quotes: e.g., '0' or '00'
  result = result.replace(new RegExp(`${key}+\\s*`), "");

  return result;
}

/**
 * Formats KHTimeUnit values according to the specified template and options
 * @param units KHTimeUnit input values
 * @param format Format template string or predefined template
 * @returns Formatted time string
 *
 * @example
 * // Using predefined template
 * formatTime({ cc: 1, pomo: 1 }, FORMAT_TEMPLATES.STANDARD) // "02:00:00"
 *
 * // Using custom format
 * formatTime({ cc: 1 }, 'CC"cc" HH"h"MM"m" :: no-pad-zero') // "1cc 1h30m"
 */
export function formatTime(
  units: KHTimeUnitInput,
  format: string | FormatTemplate = FORMAT_TEMPLATES.KH
): string {
  const { template, options } = parseFormat(
    format === undefined || format === null ? FORMAT_TEMPLATES.KH : format
  );
  const values = calculateTimeValues(units);

  //  If the KHTimeUnit equals zero, FORMAT_OPTIONS.HIDE_ZERO will returns empty string
  const allZero = !Object.values(values).some((value) => value !== 0);
  if (allZero && options.has(FORMAT_OPTIONS.HIDE_ZERO)) {
    return "";
  }

  let result = template;

  // 辅助函数：计算一个位置之前的未配对引号数量
  function countUnpairedQuotesBefore(str: string, position: number): number {
    let count = 0;
    for (let i = 0; i < position; i++) {
      if (str[i] === '"') count++;
    }
    return count % 2;
  }

  // 修改替换逻辑
  Object.entries(values).forEach(([key, value]) => {
    if (value === 0 && options.has(FORMAT_OPTIONS.HIDE_ZERO) && !allZero) {
      result = removeZeroValue(result, key);
    } else {
      const paddingLength = getPaddingLength(template, key);
      const formattedValue = options.has(FORMAT_OPTIONS.NO_PAD_ZERO)
        ? value.toString()
        : value.toString().padStart(paddingLength, "0");

      // 使用正则表达式查找所有匹配项
      const regex = new RegExp(`${key}+`, "g");
      let match;
      let lastIndex = 0;
      let newResult = "";

      while ((match = regex.exec(result)) !== null) {
        // 检查这个位置之前的未配对引号数量
        const quotesBeforeMatch = countUnpairedQuotesBefore(
          result,
          match.index
        );

        // 如果引号数量为奇数，说明这个 key 在引号内，不进行替换
        if (quotesBeforeMatch % 2 === 1) {
          newResult += result.slice(lastIndex, regex.lastIndex);
        } else {
          // 否则进行替换
          newResult += result.slice(lastIndex, match.index) + formattedValue;
        }
        lastIndex = regex.lastIndex;
      }

      // 添加剩余部分
      newResult += result.slice(lastIndex);
      result = newResult;
    }
  });

  // 只移除成对的引号，保留单独的引号
  result = result.trim().replace(/"([^"]*?)"/g, "$1");

  // If result is empty, return default format based on template pattern
  //   if (!result) {
  //     const defaultKey = template.match(/[A-Z]{2}/)?.[0] ?? "MM";
  //     const paddingLength = getPaddingLength(template, defaultKey);
  //     const unit = getDefaultUnit(template);
  //     const formattedValue = options.has(FORMAT_OPTIONS.NO_PAD_ZERO)
  //       ? "0"
  //       : "0".padStart(paddingLength, "0");
  //     return formattedValue + unit;
  //   }

  return result;
}
