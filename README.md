<div align="center">

<h1>⏱️ KHTimeUnit</h1>

<p align="center">
  <b>A TypeScript library for KH Time Unit system - an innovative and intuitive way to measure time.</b>
</p>

<div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
  <a href="https://www.npmjs.com/package/@bagaking/khtimeunit"><img src="https://img.shields.io/npm/v/@bagaking/khtimeunit.svg?style=flat-square" alt="npm version" /></a>
  <a href="https://github.com/bagaking/KHTimeUnit/actions/workflows/test.yml"><img src="https://github.com/bagaking/KHTimeUnit/actions/workflows/test.yml/badge.svg" alt="Build Status" /></a>
  <a href="https://codecov.io/gh/bagaking/KHTimeUnit"><img src="https://codecov.io/gh/bagaking/KHTimeUnit/branch/main/graph/badge.svg" alt="Coverage Status"/></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=flat-square&logo=typescript" alt="TypeScript" /></a>
</div>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a>
</p>

</div>

---

<p align="center">
  <b>🌟 Fuzzy Time Units</b> &nbsp;|&nbsp; 
  <b>🔄 Multiple Formats</b> &nbsp;|&nbsp; 
  <b>⚡ Zero Dependencies</b>
</p>

## 🌟 Features

- **Fuzzy Time Units**: Three-level time measurement system
  - `cc`: 80-100 minutes (avg. 90 min)
  - `pomo`: 20-40 minutes (avg. 30 min)
  - `q`: 10-20 minutes (avg. 15 min)
- **Multiple Input Formats**: Support string, number, and object inputs
- **Rich Formatting Options**: Various output formats for different scenarios
- **Time Range Calculations**: Built-in support for time range operations
- **Type Safety**: Full TypeScript support with strict type checking
- **Zero Dependencies**: Lightweight and efficient

## 🎯 Core Features

### Time Unit Operations

```typescript
const time = new KHTimeUnit("1cc"); // 90 minutes

// Scaling
const doubled = time.scale(2);      // "2cc" (180 minutes)
const halved = time.scale(0.5);     // "2pomo" (45 minutes)

// Cloning
const clone = time.clone();         // Create an independent copy

// Range Checking
const isInRange = time.isWithinRange(100);  // Check if 100 minutes falls within the time range
```

### Advanced Time Estimation

```typescript
const estimate = KHTimeUnit.estimateFromMinutes(150);

// Get minimal representation (using maximum unit values)
console.log(estimate.asMinimal.toString());  // e.g., "2cc"
console.log(estimate.asMinimal.getTimeRange());  // { min: 120, max: 240 }

// Get maximal representation (using minimum unit values)
console.log(estimate.asMaximal.toString());  // e.g., "1cc 2pomo"
console.log(estimate.asMaximal.getTimeRange());  // { min: 100, max: 200 }

// Get average approximation
console.log(estimate.asAverage.toString());  // Best approximation of 150 minutes
console.log(estimate.asAverage.toMinutes()); // 150
```

### Range Calculations

```typescript
const time = new KHTimeUnit("1cc 1pomo"); // 90 + 30 = 120 minutes

// Get time range
const range = time.getTimeRange();
console.log(range); // { min: 80, max: 160 }

// Check if duration falls within range
console.log(time.isWithinRange(100)); // true
console.log(time.isWithinRange(200)); // false

// Sum ranges of multiple time units
const ranges = KHTimeUnit.sumRange([
  new KHTimeUnit("1cc"),    // 80-100 min
  new KHTimeUnit("1pomo"),  // 20-40 min
]);
console.log(ranges); // { min: 100, max: 140, average: 120 }
```

## 📦 Installation

```bash
# Using npm
npm install @bagaking/khtimeunit

# Using yarn
yarn add @bagaking/khtimeunit

# Using pnpm
pnpm add @bagaking/khtimeunit
```

## 🚀 Quick Start

```typescript
import { KHTimeUnit, FORMAT_TEMPLATES } from '@bagaking/khtimeunit';

// Create from string
const time = new KHTimeUnit("1cc 2pomo");

// Different format outputs
console.log(time.toString(FORMAT_TEMPLATES.KH));        // "1cc 2pomo"
console.log(time.toString(FORMAT_TEMPLATES.HUMAN));     // "02小时 30分钟"
console.log(time.toString(FORMAT_TEMPLATES.STANDARD));  // "02:30:00"
console.log(time.toString(FORMAT_TEMPLATES.SIMPLE));    // "2h 30m"

// Time calculations
const minutes = time.toMinutes();  // 150
const hours = time.toHours();      // 2.5
const range = time.getTimeRange(); // { min: 100, max: 200 }
```

## 📖 Usage Examples

### Creating Time Units

```typescript
// From string
const time1 = new KHTimeUnit("1cc 2pomo 3q");

// From minutes
const time2 = new KHTimeUnit(150);

// From object
const time3 = new KHTimeUnit({ cc: 1, pomo: 2, q: 3 });

// Using factory methods
const time4 = KHTimeUnit.fromHours(2.5);
const time5 = KHTimeUnit.fromSeconds(9000);
```

### Time Operations

```typescript
const time1 = new KHTimeUnit("1cc");    // 90 minutes
const time2 = new KHTimeUnit("2pomo");   // 60 minutes

// Addition
const sum = time1.add(time2);
console.log(sum.toString());  // "1cc 2pomo"

// Subtraction
const diff = time1.subtract(time2);
console.log(diff.toString()); // "1pomo"

// Comparisons
console.log(time1.isLongerThan(time2));  // true
console.log(time1.isShorterThan(time2)); // false
console.log(time1.equals(time2));        // false
```

## 🛠️ API Reference

### Class: KHTimeUnit

#### Constructor

```typescript
constructor(input: number | string | KHTimeUnitInput)
```

#### Static Methods

```typescript
static fromHours(hours: number): KHTimeUnit
static fromMinutes(minutes: number): KHTimeUnit
static fromSeconds(seconds: number): KHTimeUnit
static estimateFromMinutes(minutes: number): EstimationResult
```

#### Instance Methods

```typescript
toString(format?: FormatTemplate | string): string
toMinutes(): number
toHours(): number
toSeconds(): number
getTimeRange(): { min: number; max: number }
add(other: KHTimeUnit): KHTimeUnit
subtract(other: KHTimeUnit): KHTimeUnit
isLongerThan(other: KHTimeUnit): boolean
isShorterThan(other: KHTimeUnit): boolean
equals(other: KHTimeUnit): boolean
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the KH Time Unit System (thanks for hard work everyday)
- Thanks to all contributors who have helped this project

## 📧 Contact

- Author: bagaking
- GitHub: [@bagaking](https://github.com/bagaking)
