/**
 * Time range definitions for KH time units
 * @constant
 */
export const TIME_RANGES = {
  /** Q unit: 10-20 minutes, avg 15 minutes */
  Q: { min: 10, max: 20, avg: 15 },
  /** POMO unit: 20-40 minutes, avg 30 minutes */
  POMO: { min: 20, max: 40, avg: 30 },
  /** CC unit: 60-120 minutes, avg 90 minutes */
  CC: { min: 80, max: 100, avg: 90 },
} as const;

/**
 * Error messages used in KHTimeUnit
 * @constant
 */
export const ERROR_MESSAGES = {
  /** Thrown when time units are negative */
  NEGATIVE: "Time units cannot be negative",
  /** Thrown when time units are not integers */
  NON_INTEGER: "Time units must be integers",
  /** Thrown when string format is invalid */
  INVALID_FORMAT: (part: string) => `Invalid format: ${part}`,
} as const;

/**
 * Regular expression patterns
 * @constant
 */
export const PATTERNS = {
  /** Pattern for matching KH time unit strings (e.g., "1cc", "2pomo", "3q") */
  UNIT: /^(\d+)(cc|pomo|q)$/,
} as const;

/**
 * Time estimation preferences
 * @constant
 */
export const ESTIMATION_PREFERENCE = {
  /** Use minimum values for time units */
  MINIMAL: "minimal",
  /** Use maximum values for time units */
  MAXIMAL: "maximal",
  /** Use average values for time units */
  AVERAGE: "average",
} as const;

/**
 * Types for time estimation preferences
 */
export type EstimationPreference =
  (typeof ESTIMATION_PREFERENCE)[keyof typeof ESTIMATION_PREFERENCE];

/**
 * Types for internal time range calculations
 */
export type TimeRangePreference = "min" | "max" | "avg";

/**
 * Format options for time representation
 * @constant
 */
export const FORMAT_OPTIONS = {
  /** Hide units when their value is 0 (e.g., "1h" instead of "1h 0m") */
  HIDE_ZERO: "hide-when-zero",
  /** Don't pad numbers with leading zeros (e.g., "1:30" instead of "01:30") */
  NO_PAD_ZERO: "no-pad-zero",
} as const;

export type FormatOption = (typeof FORMAT_OPTIONS)[keyof typeof FORMAT_OPTIONS];

/**
 * Format templates for time representation
 * Format patterns:
 * - CC, PP, QQ: KH unit numbers (cc, pomo, q)
 * - HH, MM, SS: hours, minutes, seconds
 * - "text": literal text to include
 *
 * Options (after ::):
 * - hide-when-zero: hide units when value is 0
 * - no-pad-zero: don't pad numbers with leading zeros
 *
 * @example
 * 'CC"cc" PP"pomo" QQ"q" :: hide-when-zero'  // "01cc 02pomo"
 * 'HH "hours" MM "minutes" :: no-pad-zero'   // "2 hours 30 minutes"
 * 'HH:MM: SS'                                // "02:30: 00"
 */
export const FORMAT_TEMPLATES = {
  /** KH format (e.g., "1cc 2pomo 3q") */
  KH: 'CC"cc" PP"pomo" QQ"q" :: hide-when-zero no-pad-zero',
  /** Human readable format (e.g., "01小时30分钟") */
  HUMAN: "HH小时 MM分钟",
  /** Standard time format (e.g., "01:30:00") */
  STANDARD: "HH:MM:SS",
  /** Simple format (e.g., "1h 30m") */
  SIMPLE: "HHh MMm :: hide-when-zero no-pad-zero",
  /** Full format (e.g., "01 hours 30 minutes") */
  FULL: 'HH "hours" MM "minutes" :: hide-when-zero',
} as const;

export type FormatTemplate =
  (typeof FORMAT_TEMPLATES)[keyof typeof FORMAT_TEMPLATES];
