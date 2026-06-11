# Tasks

## Phase 1 — 项目初始化与基础框架

- [X] 使用微信开发者工具创建项目，选择 TS-基础模版（普通渲染模式）
- [X] 配置 `app.json`：注册全部页面路径，配置底部 TabBar（5 个 tab，含 emoji 图标）
- [X] 创建 `docs/` 目录，放入 spec.md / architecture.md / task.md
- [X] 创建 `miniprogram/types/index.ts`，定义全部 TypeScript interface（Recipe / Ingredient / InventoryItem / ShoppingItem）
- [X] 创建 `utils/storage.ts`，封装所有本地存储读写函数（getRecipes / saveRecipes / getInventory / saveInventory / getShoppingItems / saveShoppingItems / getCustomCategories / saveCustomCategories / getCustomLocations / saveCustomLocations）
- [X] 创建 `utils/seed.ts`，写入示例菜谱（5 条）和示例库存（8 条）
- [X] 在 `app.ts` 中实现首次启动检测，若 `initialized` 不存在则写入 seed 数据
- [X] 在 `app.wxss` 中定义全局 CSS 变量（颜色、圆角、阴影）
- [X] 创建全部页面的空壳文件（.ts / .wxml / .wxss），确保小程序能正常编译启动

## Phase 2 — 业务逻辑层

- [ ] 创建 `utils/recipe.ts`：实现 `getCategories()`、`addCategory()`、`matchIngredients()`
- [ ] 创建 `utils/inventory.ts`：实现 `getLocations()`、`addLocation()`、`getExpiryStatus()`、`adjustQty()`
- [ ] 创建 `utils/shopping.ts`：实现 `getAutoItems()`（自动汇总逻辑，含去重）、`markAsPurchased()`（已购买逻辑，更新或新建库存）

## Phase 3 — 菜谱库页面

- [ ] `pages/recipes/recipes`：列表展示所有菜谱，支持按分类筛选（Tab 切换）和按菜名搜索
- [ ] `pages/recipes/edit`：新增 / 编辑菜谱表单，含菜名、分类选择（支持新增自定义分类）、食材动态列表（增删行）、做法文本域
- [ ] 菜谱卡片：显示菜名、分类标签（带颜色）、食材简要列表
- [ ] 删除菜谱：二次确认（`wx.showModal`）后删除

## Phase 4 — 库存页面

- [ ] `pages/inventory/inventory`：按存放位置分组展示食材，各组可折叠
- [ ] 每项显示：名称、数量（含 +/- 快捷按钮）、单位、保质期状态标签（已过期/即将到期/正常）
- [ ] 「需要购买」开关，切换 `needBuy` 状态
- [ ] `pages/inventory/edit`：新增 / 编辑食材表单，含名称、数量、单位、存放位置（支持新增自定义位置）、保质期日期选择
- [ ] 删除食材：二次确认后删除

## Phase 5 — 今天吃页面

- [ ] `pages/today/today`：展示所有 `isToday === true` 的菜谱卡片
- [ ] 每张卡片显示：菜名、分类标签、食材列表
- [ ] 「✅ 做完了」按钮：将该菜 `isToday` 设为 `false`，从列表移除
- [ ] 空状态页：提示引导用户前往"冰箱能做什么"或"菜谱库"

## Phase 6 — 冰箱能做什么页面

- [ ] `pages/fridge/fridge`：读取所有菜谱和库存，计算每个菜谱的可做状态
- [ ] 分组展示：「可以做」（全部食材满足）和「差一点点」（缺 1–2 项）
- [ ] 可以做的卡片：显示菜名、分类、食材状态，提供「加入今天吃」按钮
- [ ] 差一点点的卡片（优化项）：显示缺少的食材名称列表

## Phase 7 — 购物袋页面

- [ ] `pages/shopping/shopping`：自动汇总项（只读）+ 手动添加项合并展示
- [ ] 手动添加表单：输入名称（必填）、数量、单位，添加为 ShoppingItem
- [ ] 「已购买」操作：更新/新建库存，移除该项，操作后给出轻提示（`wx.showToast`）
- [ ] 手动添加项支持删除

## Phase 8 — 整体打磨

- [ ] 确认所有页面 `onShow` 时重新读取数据（保证 TabBar 切换后数据同步）
- [ ] 统一各页面空状态展示和引导文案
- [ ] 检查全局样式变量引用一致性，去除 magic color 值
- [ ] 在真机上走一遍完整使用流程，修复发现的问题

## Done

### 2026-06-12: Phase 1 项目初始化与基础框架完成 ✅
- 实现/变更文件
  - `app.json` — 注册 7 个页面（5 个 TabBar 主页 + recipes/edit、inventory/edit 两个子页面），配置底部 TabBar；emoji 直接写在 tab `text` 中（🍽️今天吃 / ❄️冰箱 / 📖菜谱 / 🧊库存 / 🛒购物袋），避免依赖外部图片资源；导航栏标题与底色统一为米白 `#FBF8F3`
  - `miniprogram/types/index.ts` — 定义 Ingredient / Recipe / InventoryItem / ShoppingItem，附带 FridgeStatus、ExpiryStatus 辅助类型
  - `miniprogram/utils/storage.ts` — 本地存储唯一封装层；`KEYS` 常量集中管理 key；通用 `read/write` 容错（key 不存在返回默认空值、绝不抛异常）；导出 get/save 系列函数 + `isInitialized/setInitialized` + `genId()`
  - `miniprogram/utils/seed.ts` — 示例数据导出为 `seedRecipes()` / `seedInventory()` 函数，保证 id 唯一、保质期相对“今天”动态计算；5 菜谱（番茄炒蛋/蒜蓉炒菠菜/紫菜蛋花汤/白米饭/土豆炖鸡）+ 8 库存（覆盖冷藏/冷冻/常温/调料区）
  - `app.ts` — onLaunch 首次启动检测，`initialized` 不存在时写入 seed 数据
  - `app.wxss` — 全局 CSS 变量（配色/圆角/阴影）+ 通用 `.card`、`.empty` 样式
  - 7 个页面空壳（today / fridge / recipes / recipes/edit / inventory / inventory/edit / shopping），各含 .ts/.wxml/.wxss/.json，统一空状态占位
- 设计上的要点
  - 严格遵守约束：普通渲染（已将 project.config.json 的 `skylineRenderEnable` 关掉）、原生 wxss、仅本地存储、所有存储读写统一走 storage.ts
  - seed 数据中食材名称与库存名称对齐，为 Phase 6「冰箱能做什么」匹配算法预留正确数据（白米饭故意缺“大米”库存，可演示“差一点点”状态）
  - ID 生成 `Date.now() + Math.random()`，不引入外部依赖
- 清理：删除模版默认的 `pages/index`、`pages/logs` 及未使用的 `utils/util.ts`
- 待验证（需在微信开发者工具中执行，本地无 tsc 环境）
  - 导入项目后能正常编译启动、TabBar 5 个 tab 正常显示
  - 首次启动后 Storage 面板中可见 recipes(5) / inventory(8) / initialized=true
