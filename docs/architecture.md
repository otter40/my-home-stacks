# architecture.md — 技术架构说明

## 1. 技术栈

| 项目 | 选型 |
|------|------|
| 平台 | 微信小程序 |
| 语言 | TypeScript（TS-基础模版） |
| 渲染模式 | 普通渲染（非 Skyline） |
| 样式 | 原生 wxss（不使用 Sass/Less） |
| 数据存储 | 微信本地存储（`wx.setStorageSync` / `wx.getStorageSync`） |
| 外部依赖 | 无 |

---

## 2. 目录结构

```
project-root/
├── CLAUDE.md
├── docs/
│   ├── spec.md
│   ├── architecture.md
│   └── task.md
└── miniprogram/
    ├── app.ts               # 小程序入口，首次启动写入 seed 数据
    ├── app.json             # 全局配置（TabBar、页面注册）
    ├── app.wxss             # 全局样式变量
    ├── types/
    │   └── index.ts         # 所有 TypeScript interface 定义
    ├── utils/
    │   ├── storage.ts       # 本地存储读写封装（唯一允许调用 wx.Storage 的地方）
    │   ├── recipe.ts        # 菜谱业务逻辑
    │   ├── inventory.ts     # 库存业务逻辑
    │   ├── shopping.ts      # 购物袋业务逻辑（含自动汇总逻辑）
    │   └── seed.ts          # 初始示例数据
    └── pages/
        ├── today/           # 今天吃
        │   ├── today.ts
        │   ├── today.wxml
        │   └── today.wxss
        ├── fridge/          # 冰箱能做什么
        │   ├── fridge.ts
        │   ├── fridge.wxml
        │   └── fridge.wxss
        ├── recipes/         # 菜谱库
        │   ├── recipes.ts
        │   ├── recipes.wxml
        │   ├── recipes.wxss
        │   └── edit/        # 新增/编辑菜谱子页面
        │       ├── edit.ts
        │       ├── edit.wxml
        │       └── edit.wxss
        ├── inventory/       # 库存
        │   ├── inventory.ts
        │   ├── inventory.wxml
        │   ├── inventory.wxss
        │   └── edit/        # 新增/编辑食材子页面
        │       ├── edit.ts
        │       ├── edit.wxml
        │       └── edit.wxss
        └── shopping/        # 购物袋
            ├── shopping.ts
            ├── shopping.wxml
            └── shopping.wxss
```

---

## 3. 数据存储方案

### 3.1 Storage Key 一览

| Key | 类型 | 说明 |
|-----|------|------|
| `recipes` | `Recipe[]` | 所有菜谱 |
| `inventory` | `InventoryItem[]` | 所有库存食材 |
| `shoppingItems` | `ShoppingItem[]` | 购物袋手动添加项 |
| `customCategories` | `string[]` | 用户自定义菜谱分类 |
| `customLocations` | `string[]` | 用户自定义存放位置 |
| `initialized` | `boolean` | 是否已写入 seed 数据 |

### 3.2 存储封装原则

- **所有读写操作必须通过 `utils/storage.ts` 进行**，页面层不直接调用 `wx.setStorageSync`
- 读取时若 key 不存在返回对应类型的空默认值（空数组等），不抛出异常
- 写入时整个数组覆盖写（read → modify → write），不做部分更新

```typescript
// storage.ts 对外暴露的接口示意
export function getRecipes(): Recipe[]
export function saveRecipes(recipes: Recipe[]): void
export function getInventory(): InventoryItem[]
export function saveInventory(items: InventoryItem[]): void
export function getShoppingItems(): ShoppingItem[]
export function saveShoppingItems(items: ShoppingItem[]): void
export function getCustomCategories(): string[]
export function saveCustomCategories(cats: string[]): void
export function getCustomLocations(): string[]
export function saveCustomLocations(locs: string[]): void
```

### 3.3 ID 生成

使用 `Date.now().toString() + Math.random().toString(36).slice(2)` 生成唯一 ID，不依赖外部库。

---

## 4. 业务逻辑层（utils/）

### recipe.ts
- `getCategories()` — 返回默认分类 + 用户自定义分类的合并列表
- `addCategory(name)` — 新增自定义分类
- `matchIngredients(recipe, inventory)` — 返回该菜谱食材的匹配状态

### inventory.ts
- `getLocations()` — 返回默认位置 + 用户自定义位置的合并列表
- `addLocation(name)` — 新增自定义存放位置
- `getExpiryStatus(item)` — 返回 `'expired'` / `'soon'` / `'ok'`
- `adjustQty(id, delta)` — 数量加减（最小为 0）

### shopping.ts
- `getAutoItems(recipes, inventory)` — 计算自动汇总项（去重合并）
- `markAsPurchased(item, inventory)` — 执行"已购买"逻辑，更新库存并移除该项

---

## 5. 页面与数据流

```
用户操作
    │
    ▼
页面 (.ts) — onShow/onLoad 时从 utils 读取数据，赋给 data
    │
    ▼
utils/*.ts — 业务逻辑处理
    │
    ▼
utils/storage.ts — 读写本地存储
    │
    ▼
wx.setStorageSync / wx.getStorageSync
```

- 页面切换时（`onShow`）重新读取数据，确保 TabBar 切换后数据同步
- 不使用全局状态管理，数据来源始终是本地存储

---

## 6. 冰箱推荐算法

```typescript
// 对每个菜谱计算可做状态
function calcFridgeStatus(recipe: Recipe, inventory: InventoryItem[]) {
  const missing: string[] = []
  for (const ing of recipe.ingredients) {
    const item = inventory.find(
      inv => inv.name.trim().toLowerCase() === ing.name.trim().toLowerCase()
    )
    if (!item || item.qty <= 0) missing.push(ing.name)
  }
  if (missing.length === 0) return { status: 'ok', missing: [] }
  if (missing.length <= 2) return { status: 'almost', missing }
  return { status: 'no', missing }
}
```

---

## 7. 全局样式变量（app.wxss）

```css
page {
  --color-bg: #FBF8F3;          /* 米白底色 */
  --color-primary: #F4845F;      /* 橙色，主强调色 */
  --color-green: #6DBF86;        /* 绿色，可做/完成状态 */
  --color-yellow: #F9C74F;       /* 黄色，差一点点/警告 */
  --color-red: #E05C5C;          /* 红色，已过期 */
  --color-text: #2D2D2D;         /* 主文字色 */
  --color-text-secondary: #888;  /* 辅助文字色 */
  --color-border: #EEE8E0;       /* 边框色 */
  --radius-card: 12px;
  --shadow-card: 0 2px 8px rgba(0,0,0,0.06);
}
```
