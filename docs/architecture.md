# architecture.md — 技术架构说明（v2）

## 1. 技术栈

| 项目 | 选型 |
|------|------|
| 平台 | 微信小程序 |
| 语言 | TypeScript（TS-基础模版） |
| 渲染模式 | 普通渲染（非 Skyline） |
| 样式 | 原生 wxss（不使用 Sass/Less），Notion 浅色风 |
| 数据存储 | 微信本地存储 |
| 外部依赖 | 无 |

---

## 2. 目录结构（目标）

```
miniprogram/
├── app.ts                  # 入口：schema 版本检查 + 首次/升级写入 seed
├── app.json                # TabBar（5）+ 页面注册
├── app.wxss                # Notion 浅色全局变量 + 通用组件样式
├── types/
│   └── index.ts            # 全部 interface + 选项常量类型
├── constants/
│   └── options.ts          # 各分类/标签默认选项常量
├── utils/
│   ├── storage.ts          # 本地存储读写封装（唯一调用 wx.Storage 处）+ schema 迁移
│   ├── seed.ts             # 示例数据（食材库→库存/菜谱 引用）
│   ├── ingredient.ts       # 食材库业务（增删改、按分类分组、反向关联菜谱）
│   ├── recipe.ts           # 菜谱业务（选项合并、主料匹配、冰箱状态、加入今天吃）
│   ├── stock.ts            # 库存业务（位置/状态、保质期、加减、做完扣减）
│   ├── shopping.ts         # 购物袋（自动汇总、已购买入库）
│   └── stats.ts            # 使用统计（基于 CookRecord）
└── pages/
    ├── home/               # 首页
    ├── stock/  (+edit/)    # 库存
    ├── recipes/ (+edit/)   # 菜谱
    ├── ingredients/ (+edit/) # 食材库
    ├── shopping/           # 购物袋（子页面）
    └── profile/            # 我的
```

---

## 3. 数据存储方案

### 3.1 Storage Key

| Key | 类型 | 说明 |
|-----|------|------|
| `ingredients` | `Ingredient[]` | 食材库 |
| `recipes` | `Recipe[]` | 菜谱 |
| `stock` | `StockItem[]` | 库存 |
| `shoppingItems` | `ShoppingItem[]` | 购物袋手动项 |
| `cookHistory` | `CookRecord[]` | 做菜历史 |
| `customOptions` | `CustomOptions` | 用户自定义选项 |
| `schemaVersion` | `number` | 数据结构版本 |
| `initialized` | `boolean` | 是否已写入 seed |

### 3.2 封装原则

- **所有读写必须通过 `utils/storage.ts`**，页面与其它 utils 不直接调 `wx.*Storage`。
- 读取时 key 不存在返回类型默认值（空数组/空对象），不抛异常。
- 写入整体覆盖（read → modify → write）。
- ID：`Date.now().toString() + Math.random().toString(36).slice(2)`。

### 3.3 Schema 版本与迁移

- 当前 `SCHEMA_VERSION = 2`。
- `app.ts onLaunch`：读取 `schemaVersion`，若与当前不一致（含 v1 旧数据），**清空全部业务数据并重新写入 v2 seed**，再写入新版本号。（已与用户确认本地无需保留数据，故直接重置而非迁移。）
- 「我的」页的清空/重置复用同一套写 seed 逻辑。

---

## 4. 业务逻辑层（utils/）

### ingredient.ts
- `getIngredients()` / `saveIngredient()` / `removeIngredient(id)`
- `getIngredient(id)` — 按 id 取（菜谱/库存渲染时把 ingredientId 映射成名称/分类）
- `groupByCategory()` — 按食材分类分组
- `recipesUsing(id)` — 反向关联：返回引用该食材的菜谱
- `stockTotalOf(id)` — 该食材当前库存合计
- `findOrCreateByName(name)` — 已购买/手动项落库时用

### recipe.ts
- `getRecipeTypes()` / `getCuisines()` / `getPrepOptions()` — 默认 + 自定义合并
- `isSeasoning(category)` — 判断是否调味/香料/佐料（决定 main 默认值）
- `matchByMain(recipe, stock)` — 只看主料的匹配结果
- `calcFridgeStatus(recipe, stock)` — ok / almost / no（基于主料）
- `setToday(id, value)` — 加入/移出今天想吃
- `cookDone(recipe)` — 调 stock.deductForRecipe + 写 CookRecord + isToday=false

### stock.ts
- `getLocations()` / `addLocation()`、`getStatuses()` / `addStatus()`
- `getExpiryStatus(item)` — expired / soon(≤3天) / ok
- `adjustQty(id, delta)` — 加减（最小 0）
- `toggleNeedBuy(id)` — 按钮式切换
- `deductForRecipe(recipe)` — 做完了扣减（按到期日升序）

### shopping.ts
- `getAutoItems(recipes, stock)` — 今天想吃缺料(主+辅) + needBuy，按 ingredientId/名称去重
- `markAsPurchased(item)` — 入库（关联食材库，必要时新建食材）

### stats.ts
- `weeklyCooked()` / `monthlyCooked()` / `topDishes()` — 基于 cookHistory

---

## 5. 页面与数据流

```
页面 onShow/onLoad → utils 业务函数 → utils/storage.ts → wx.Storage
```
- TabBar 页 `onShow` 重新读取，保证切换后同步。
- 菜谱/库存渲染时通过 `ingredientId` 经 `ingredient.ts` 映射出名称/分类（不在存储里冗余名称）。
- 不使用全局状态管理，数据来源始终是本地存储。

---

## 6. 冰箱推荐算法（只看主料）

```typescript
function calcFridgeStatus(recipe: Recipe, stock: StockItem[]) {
  const mains = recipe.ingredients.filter(i => i.main);
  const missing: string[] = [];
  for (const ing of mains) {
    const total = stock
      .filter(s => s.ingredientId === ing.ingredientId)
      .reduce((sum, s) => sum + s.qty, 0);
    if (total <= 0) missing.push(ing.ingredientId);
  }
  if (missing.length === 0) return 'ok';
  if (missing.length <= 2) return 'almost';
  return 'no'; // 不展示
}
```

做完了扣减：遍历 recipe 全部食材，按 ingredientId 在库存中按到期日升序扣减至 0。

---

## 7. 全局样式变量（app.wxss，Notion 浅色）

```css
page {
  --color-bg: #FFFFFF;            /* 主底色 */
  --color-bg-soft: #F7F7F5;       /* 浅灰分区底 */
  --color-card: #FFFFFF;
  --color-text: #37352F;          /* 主文字 */
  --color-text-secondary: #9B9A97;/* 次要文字 */
  --color-border: #EAE9E6;        /* 分割线/边框 */
  --color-accent: #2383E2;        /* 强调蓝 */
  --color-green: #4DAB6D;          /* 可做/完成 */
  --color-yellow: #D9A441;         /* 差一点点/警告 */
  --color-red: #E03E3E;            /* 过期/删除 */
  --color-chip-bg: #F1F0EE;        /* 标签底 */
  --radius-card: 8px;
  --shadow-card: 0 1px 2px rgba(0,0,0,0.04);
}
```

分类标签建议用低饱和底色 + 深字（Notion chip 风），具体配色在实现时统一到一组 chip class。
