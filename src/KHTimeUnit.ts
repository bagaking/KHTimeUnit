import {
  TIME_RANGES,
  ERROR_MESSAGES,
  PATTERNS,
  FORMAT_TEMPLATES,
  FormatTemplate,
} from "./constants";
import { formatTime, fromMinutes, toMinutes } from "./formatters";

/**
 * Interface for KHTimeUnit input object
 * @interface
 */
export interface KHTimeUnitInput {
  /** Number of 'q' units (10-20 minutes each) */
  q?: number;
  /** Number of 'pomo' units (20-40 minutes each) */
  pomo?: number;
  /** Number of 'cc' units (60-120 minutes each) */
  cc?: number;
}

/**
 * KHTimeUnit class represents a time duration using the KH time unit system.
 * @class
 */
export class KHTimeUnit {
  private _q = 0;
  private _pomo = 0;
  private _cc = 0;
  private _isDirectInput = false;

  // Getters
  public get q(): number {
    return this._q;
  }
  public get pomo(): number {
    return this._pomo;
  }
  public get cc(): number {
    return this._cc;
  }

  constructor(input: number | string | KHTimeUnitInput) {
    this._isDirectInput = true;
    if (typeof input === "number") {
      const units = fromMinutes(input);
      this.setUnits(units);
      this._isDirectInput = false;
    } else if (typeof input === "string") {
      const parsed = KHTimeUnit.parseString(input);
      this.setUnits(parsed);
    } else {
      this.setUnits(input);
    }
    this.validate();
  }

  private setUnits(input: KHTimeUnitInput): void {
    this._q = input.q ?? 0;
    this._pomo = input.pomo ?? 0;
    this._cc = input.cc ?? 0;
  }

  private validate(): void {
    if (
      !Number.isInteger(this._q) ||
      !Number.isInteger(this._pomo) ||
      !Number.isInteger(this._cc)
    ) {
      throw new Error(ERROR_MESSAGES.NON_INTEGER);
    }
    if (
      this._isDirectInput &&
      (this._q < 0 || this._pomo < 0 || this._cc < 0) &&
      this.toMinutes() < 0
    ) {
      throw new Error(ERROR_MESSAGES.NEGATIVE);
    }
  }

  // Conversion methods
  public toMinutes(): number {
    return toMinutes({ q: this._q, pomo: this._pomo, cc: this._cc });
  }

  public toHours(): number {
    return this.toMinutes() / 60;
  }

  public toSeconds(): number {
    return this.toMinutes() * 60;
  }

  // String formatting
  public toString(format?: string | FormatTemplate): string {
    return formatTime(
      { q: this._q, pomo: this._pomo, cc: this._cc },
      format ?? FORMAT_TEMPLATES.KH
    );
  }

  // Static factory methods
  public static fromHours(hours: number): KHTimeUnit {
    return new KHTimeUnit(hours * 60);
  }

  public static fromSeconds(seconds: number): KHTimeUnit {
    return new KHTimeUnit(seconds / 60);
  }

  public static fromMinutes(minutes: number): KHTimeUnit {
    return new KHTimeUnit(minutes);
  }

  public static parseString(input: string): KHTimeUnitInput {
    const result: KHTimeUnitInput = { q: 0, pomo: 0, cc: 0 };
    const parts = input.toLowerCase().trim().split(/\s+/);

    for (const part of parts) {
      const match = part.match(PATTERNS.UNIT);
      if (!match) {
        throw new Error(ERROR_MESSAGES.INVALID_FORMAT(part));
      }
      const [, count, unit] = match;
      const value = parseInt(count, 10);

      switch (unit) {
        case "cc":
          result.cc = value;
          break;
        case "pomo":
          result.pomo = value;
          break;
        case "q":
          result.q = value;
          break;
      }
    }
    return result;
  }

  // Arithmetic operations
  public add(other: KHTimeUnit): KHTimeUnit {
    return new KHTimeUnit(this.toMinutes() + other.toMinutes());
  }

  public subtract(other: KHTimeUnit): KHTimeUnit {
    const result = new KHTimeUnit(this.toMinutes() - other.toMinutes());
    result._isDirectInput = false;
    return result;
  }

  // Comparison methods
  public equals(other: KHTimeUnit): boolean {
    const thisRange = this.getTimeRange();
    const otherRange = other.getTimeRange();

    // If either unit is zero, they're equal only if both are zero
    if (this.toMinutes() === 0 || other.toMinutes() === 0) {
      return this.toMinutes() === other.toMinutes();
    }

    // Check if ranges overlap
    return thisRange.min <= otherRange.max && thisRange.max >= otherRange.min;
  }

  public isLongerThan(other: KHTimeUnit): boolean {
    return this.toMinutes() > other.toMinutes();
  }

  public isShorterThan(other: KHTimeUnit): boolean {
    return this.toMinutes() < other.toMinutes();
  }

  public isWithinRange(minutes: number): boolean {
    const range = this.getTimeRange();
    return minutes >= range.min && minutes <= range.max;
  }

  // Range calculations
  public getTimeRange(): { min: number; max: number } {
    return {
      min:
        this._cc * TIME_RANGES.CC.min +
        this._pomo * TIME_RANGES.POMO.min +
        this._q * TIME_RANGES.Q.min,
      max:
        this._cc * TIME_RANGES.CC.max +
        this._pomo * TIME_RANGES.POMO.max +
        this._q * TIME_RANGES.Q.max,
    };
  }

  // Static utility methods
  public static sumRange(units: KHTimeUnit[]): {
    min: number;
    max: number;
    average: number;
  } {
    return units.reduce(
      (acc, unit) => {
        const range = unit.getTimeRange();
        return {
          min: acc.min + range.min,
          max: acc.max + range.max,
          average: acc.average + unit.toMinutes(),
        };
      },
      { min: 0, max: 0, average: 0 }
    );
  }

  /**
   * Estimates KHTimeUnit based on target minutes.
   * Returns three possible representations:
   * - asMinimal: The smallest KHTimeUnit whose minimum possible duration covers the target minutes
   * - asMaximal: The largest KHTimeUnit whose maximum possible duration is needed to cover the target minutes
   * - asAverage: A KHTimeUnit that best approximates the target minutes using average values
   *
   * @example
   * For 150 minutes:
   * const estimate = KHTimeUnit.estimateFromMinutes(150);
   * estimate.asMinimal  // "2cc" (min: 120min, max: 240min)
   * estimate.asMaximal  // "1cc 2pomo" (min: 100min, max: 200min)
   * estimate.asAverage  // exact units totaling 150min
   *
   * @param {number} minutes - Target duration in minutes
   * @returns {{ asMinimal: KHTimeUnit, asMaximal: KHTimeUnit, asAverage: KHTimeUnit }} All possible estimations
   */
  public static estimateFromMinutes(minutes: number): {
    asMinimal: KHTimeUnit;
    asMaximal: KHTimeUnit;
    asAverage: KHTimeUnit;
  } {
    // 平均值估算：直接使用构造函数
    const asAverage = new KHTimeUnit(minutes);

    // 最小估算：使用最大单位值
    let remainingMinutes = minutes;
    const minimalResult = { cc: 0, pomo: 0, q: 0 };
    while (remainingMinutes > 0) {
      if (remainingMinutes >= TIME_RANGES.CC.max) {
        minimalResult.cc++;
        remainingMinutes -= TIME_RANGES.CC.max;
      } else if (remainingMinutes >= TIME_RANGES.POMO.max) {
        minimalResult.pomo++;
        remainingMinutes -= TIME_RANGES.POMO.max;
      } else if (remainingMinutes > 0) {
        minimalResult.q++;
        remainingMinutes -= TIME_RANGES.Q.max;
      }
    }
    const asMinimal = new KHTimeUnit(minimalResult);
    asMinimal._isDirectInput = false;

    // 最大估算：使用最小单位值
    remainingMinutes = minutes;
    const maximalResult = { cc: 0, pomo: 0, q: 0 };
    while (remainingMinutes > 0) {
      if (remainingMinutes > TIME_RANGES.CC.min) {
        maximalResult.cc++;
        remainingMinutes -= TIME_RANGES.CC.min;
      } else if (remainingMinutes > TIME_RANGES.POMO.min) {
        maximalResult.pomo++;
        remainingMinutes -= TIME_RANGES.POMO.min;
      } else if (remainingMinutes > 0) {
        maximalResult.q++;
        remainingMinutes -= TIME_RANGES.Q.min;
      }
    }
    const asMaximal = new KHTimeUnit(maximalResult);
    asMaximal._isDirectInput = false;

    return { asMinimal, asMaximal, asAverage };
  }

  // Utility methods
  public clone(): KHTimeUnit {
    return new KHTimeUnit({ q: this._q, pomo: this._pomo, cc: this._cc });
  }

  public scale(factor: number): KHTimeUnit {
    const minutes = Math.round(this.toMinutes() * factor);
    const result = new KHTimeUnit(minutes);

    result._isDirectInput = false;
    return result;
  }
}
