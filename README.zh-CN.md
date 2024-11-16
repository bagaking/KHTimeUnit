# KHTimeUnit

<div align="center">

<h1>⏱️ KHTimeUnit</h1>

<p align="center">
  <b>KH时间度量系统 - 一种直观的"模糊"时间度量方式</b>
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
  <b>🌟 模糊时间单位</b> &nbsp;|&nbsp; 
  <b>🔄 多种格式</b> &nbsp;|&nbsp; 
  <b>⚡ 零依赖</b>
</p>

## 🌟 特性

- **模糊时间单位**: 三级时间度量系统
  - `cc`: 80-100 分钟 (平均 90 分钟)
  - `pomo`: 20-40 分钟 (平均 30 分钟)
  - `q`: 10-20 分钟 (平均 15 分钟)
- **多种输入格式**: 支持字符串、数字和对象输入
- **丰富的格式化选项**: 适应不同场景的输出格式
- **时间范围计算**: 内置时间范围运算支持
- **类型安全**: 完整的 TypeScript 支持和严格类型检查
- **零依赖**: 轻量且高效

## 🎯 核心功能

### 时间单位运算

```typescript
const time = new KHTimeUnit("1cc"); // 90 分钟

// 缩放
const doubled = time.scale(2);      // "2cc" (180 分钟)
const halved = time.scale(0.5);     // "2pomo" (45 分钟)

// 克隆
const clone = time.clone();         // 创建独立副本

// 范围检查
const isInRange = time.isWithinRange(100);  // 检查 100 分钟是否在时间范围内
```

### 高级时间估算

```typescript
const estimate = KHTimeUnit.estimateFromMinutes(150);

// 获取最小表示（使用最大单位值）
console.log(estimate.asMinimal.toString());  // 例如："2cc"
console.log(estimate.asMinimal.getTimeRange());  // { min: 120, max: 240 }

// 获取最大表示（使用最小单位值）
console.log(estimate.asMaximal.toString());  // 例如："1cc 2pomo"
console.log(estimate.asMaximal.getTimeRange());  // { min: 100, max: 200 }

// 获取平均近似值
console.log(estimate.asAverage.toString());  // 最接近 150 分钟的表示
console.log(estimate.asAverage.toMinutes()); // 150
```

### 范围计算

```typescript
const time = new KHTimeUnit("1cc 1pomo"); // 90 + 30 = 120 分钟

// 获取时间范围
const range = time.getTimeRange();
console.log(range); // { min: 80, max: 160 }

// 检查持续时间是否在范围内
console.log(time.isWithinRange(100)); // true
console.log(time.isWithinRange(200)); // false

// 计算多个时间单位的范围总和
const ranges = KHTimeUnit.sumRange([
  new KHTimeUnit("1cc"),    // 80-100 分钟
  new KHTimeUnit("1pomo"),  // 20-40 分钟
]);
console.log(ranges); // { min: 100, max: 140, average: 120 }
```

## 📦 安装

```bash
# 使用 npm
npm install @bagaking/khtimeunit

# 使用 yarn
yarn add @bagaking/khtimeunit

# 使用 pnpm
pnpm add @bagaking/khtimeunit
```

## 🚀 快速开始

```typescript
import { KHTimeUnit, FORMAT_TEMPLATES } from '@bagaking/khtimeunit';

// 从字符串创建
const time = new KHTimeUnit("1cc 2pomo");

// 不同格式的输出
console.log(time.toString(FORMAT_TEMPLATES.KH));        // "1cc 2pomo"
console.log(time.toString(FORMAT_TEMPLATES.HUMAN));     // "02小时 30分钟"
console.log(time.toString(FORMAT_TEMPLATES.STANDARD));  // "02:30:00"
console.log(time.toString(FORMAT_TEMPLATES.SIMPLE));    // "2h 30m"

// 时间计算
const minutes = time.toMinutes();  // 150
const hours = time.toHours();      // 2.5
const range = time.getTimeRange(); // { min: 100, max: 200 }
```

## 📖 使用示例

### 创建时间单位

```typescript
// 从字符串创建
const time1 = new KHTimeUnit("1cc 2pomo 3q");

// 从分钟数创建
const time2 = new KHTimeUnit(150);

// 从对象创建
const time3 = new KHTimeUnit({ cc: 1, pomo: 2, q: 3 });

// 使用工厂方法
const time4 = KHTimeUnit.fromHours(2.5);
const time5 = KHTimeUnit.fromSeconds(9000);
```

### 时间运算

```typescript
const time1 = new KHTimeUnit("1cc");    // 90 分钟
const time2 = new KHTimeUnit("2pomo");   // 60 分钟

// 加法
const sum = time1.add(time2);
console.log(sum.toString());  // "1cc 2pomo"

// 减法
const diff = time1.subtract(time2);
console.log(diff.toString()); // "1pomo"

// 比较
console.log(time1.isLongerThan(time2));  // true
console.log(time1.isShorterThan(time2)); // false
console.log(time1.equals(time2));        // false
```

### 时间估算

```typescript
const estimate = KHTimeUnit.estimateFromMinutes(150);

console.log(estimate.asMinimal.toString());  // 最小所需单位
console.log(estimate.asMaximal.toString());  // 最大可能单位
console.log(estimate.asAverage.toString());  // 平均近似值
```

## 🛠️ API 参考

### 类：KHTimeUnit

#### 构造函数

```typescript
constructor(input: number | string | KHTimeUnitInput)
```

#### 静态方法

```typescript
static fromHours(hours: number): KHTimeUnit
static fromMinutes(minutes: number): KHTimeUnit
static fromSeconds(seconds: number): KHTimeUnit
static estimateFromMinutes(minutes: number): EstimationResult
```

#### 实例方法

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

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。重大更改则请先开启一个 issue 讨论您想要改变的内容。

1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m '添加一些很棒的特性'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- 灵感来源于日复一日的高强度工作
- 感谢所有为这个项目做出贡献的人

## 📧 联系方式

- 作者：bagaking
- GitHub：[@bagaking](https://github.com/bagaking)
