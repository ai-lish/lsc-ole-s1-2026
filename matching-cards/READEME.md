# 🎯 坐標配對卡牌 — 內容設計
**根據：中一數學 Schedule（Ch10 坐標簡介）**

---

## 📐 卡牌設計原則

- **卡 A 面（代數）**：坐標 / 直線方程 / 一元一次方程
- **卡 B 面（圖像）**：直角坐標圖 / 數線圖 的文字描述

**共 10 對，難度分級**

---

## 🌱 基礎難度（6對）

| 對 | 代數面 A | 圖像面 B |
|----|---------|---------|
| 1 | `(3, 4)` | **P在第一象限**，x=3, y=4 |
| 2 | `(-2, 1)` | **Q在第二象限**，x=-2, y=1 |
| 3 | `(-1, -3)` | **R在第三象限**，x=-1, y=-3 |
| 4 | `(2, -3)` | **S在第四象限**，x=2, y=-3 |
| 5 | `(0, 4)` | **T在y軸上**，y=4 |
| 6 | `(-3, 0)` | **U在x軸上**，x=-3 |

---

## 🌟 中級難度（8對 = 基礎 + 方程）

| 對 | 代數面 A | 圖像面 B |
|----|---------|---------|
| 1 | `(3, 4)` | **P在第一象限** |
| 2 | `(-2, 1)` | **Q在第二象限** |
| 3 | `(-1, -3)` | **R在第三象限** |
| 4 | `(2, -3)` | **S在第四象限** |
| 5 | `(0, 4)` | **T在y軸上** |
| 6 | `(-3, 0)` | **U在x軸上** |
| 7 | `x + 3 = 7` | **解：x = 4**（數線上移到4） |
| 8 | `2y = 10` | **解：y = 5**（數線上移到5） |

---

## 🔥 進階難度（10對 = 中級 + 直線方程）

| 對 | 代數面 A | 圖像面 B |
|----|---------|---------|
| 1 | `(3, 4)` | **P在第一象限** |
| 2 | `(-2, 1)` | **Q在第二象限** |
| 3 | `(-1, -3)` | **R在第三象限** |
| 4 | `(2, -3)` | **S在第四象限** |
| 5 | `(0, 4)` | **T在y軸上** |
| 6 | `(-3, 0)` | **U在x軸上** |
| 7 | `x + 3 = 7` | **解：x = 4** |
| 8 | `2y = 10` | **解：y = 5** |
| 9 | `y = x` | **直線**，斜率1，通過原點 |
| 10 | `y = 2x + 1` | **直線**，斜率2，y截距1 |

---

## 🖼️ MiniMax 圖像生成提示詞

用於生成卡牌 B 面（圖像面）的 SVG/PNG 圖：

### 坐標卡（10張）

```
直角坐標系 grid from -5 to 5 on both axes, point P marked at (3,4) with label "P", 
axes labeled x and y, light gridlines, on white background, clean vector style, math diagram
```
- Pair 1: point P at (3,4) in Q1
- Pair 2: point Q at (-2,1) in Q2
- Pair 3: point R at (-1,-3) in Q3
- Pair 4: point S at (2,-3) in Q4
- Pair 5: point T at (0,4) on y-axis
- Pair 6: point U at (-3,0) on x-axis

### 直線方程卡（2張）

```
直角坐標系 grid from -5 to 5, line y = x drawn through origin at 45 degrees, 
point (1,1) marked, axes labeled, light gridlines, on white background, clean vector style
```

```
直角坐標系 grid from -5 to 5, line y = 2x + 1 drawn, y-intercept at (0,1) marked, 
point (1,3) marked, axes labeled, light gridlines, on white background, clean vector style
```

### 方程卡（2張）

```
Simple number line from 0 to 8, arrow pointing right, point x=4 highlighted with large dot and label "x=4",
arrow showing movement from left, clean math diagram style, white background
```

---

## 📁 文件結構

```
matching-cards/
├── matching-cards.html   ← 互動 HTML 遊戲（可列印）
├── README.md            ← 本文件
└── generate-images.js   ← MiniMax Image-01 批量生成腳本
```
