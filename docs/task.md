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

- [X] 创建 `utils/recipe.ts`：实现 `getCategories()`、`addCategory()`、`matchIngredients()`
- [X] 创建 `utils/inventory.ts`：实现 `getLocations()`、`addLocation()`、`getExpiryStatus()`、`adjustQty()`
- [X] 创建 `utils/shopping.ts`：实现 `getAutoItems()`（自动汇总逻辑，含去重）、`markAsPurchased()`（已购买逻辑，更新或新建库存）

## Phase 3 — 菜谱库页面

- [X] `pages/recipes/recipes`：列表展示所有菜谱，支持按分类筛选（Tab 切换）和按菜名搜索
- [X] `pages/recipes/edit`：新增 / 编辑菜谱表单，含菜名、分类选择（支持新增自定义分类）、食材动态列表（增删行）、做法文本域
- [X] 菜谱卡片：显示菜名、分类标签（带颜色）、食材简要列表
- [X] 删除菜谱：二次确认（`wx.showModal`）后删除

## Phase 4 — 库存页面

- [X] `pages/inventory/inventory`：按存放位置分组展示食材，各组可折叠
- [X] 每项显示：名称、数量（含 +/- 快捷按钮）、单位、保质期状态标签（已过期/即将到期/正常）
- [X] 「需要购买」开关，切换 `needBuy` 状态
- [X] `pages/inventory/edit`：新增 / 编辑食材表单，含名称、数量、单位、存放位置（支持新增自定义位置）、保质期日期选择
- [X] 删除食材：二次确认后删除

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
- 验证结果：✅ 用户确认项目能正常编译启动、TabBar 正常（Storage 面板因网页版 DevTools 未能查看，跳过，留待 Phase 3/4 页面自然验证 seed 数据）

### 2026-06-12: Phase 2 业务逻辑层完成 ✅
- 实现文件
  - `miniprogram/utils/recipe.ts` — `DEFAULT_CATEGORIES`、`normalizeName()`（去空格+小写归一）、`getCategories()`、`addCategory()`、`matchIngredients()`、`calcFridgeStatus()`
  - `miniprogram/utils/inventory.ts` — `DEFAULT_LOCATIONS`、`UNCLASSIFIED_LOCATION`、`getLocations()`、`addLocation()`、`getExpiryStatus()`、`adjustQty()`
  - `miniprogram/utils/shopping.ts` — `AutoShoppingItem` 类型、`getAutoItems()`（双来源去重合并）、`markAsPurchased()`（已购买更新/新建库存）
  - `miniprogram/types/index.ts` — 新增 `IngredientMatch`、`FridgeResult` 类型
- 设计上的要点
  - 食材匹配统一走 `normalizeName()`（trim + toLowerCase），recipe / shopping 共用，保证全局匹配规则一致
  - 冰箱状态：缺 0 项=ok / 缺 1–2 项=almost / 缺 ≥3 项=no（与 architecture §6 一致），同时返回 `matches` 逐项明细供页面渲染
  - 保质期解析用 `` `${expiry}T00:00:00` `` 强制按本地时区零点，避免 'YYYY-MM-DD' 被当成 UTC 产生差一天误差；3 天内（含今天）= soon，已过期 = expired
  - `adjustQty` / `markAsPurchased` 均「读→改→整体写回」并返回最新数组，便于页面直接刷新
  - 购物袋自动汇总：① 今天吃菜谱缺料 ② 库存 needBuy=true，按归一化名称去重合并并记录 `sources`；自动项无需手动删除——库存更新后会自然从汇总中消失
  - `markAsPurchased` 只负责库存更新，购物袋移除由调用方处理（手动项删存储 / 自动项随库存刷新消失），职责清晰
- 说明：本阶段为纯逻辑层、无界面，函数将在 Phase 3–7 各页面接入并自然验证

### 2026-06-12: Phase 3 菜谱库页面完成 ✅
- 实现文件
  - `pages/recipes/recipes.{ts,wxml,wxss}` — 列表页：搜索栏（按菜名 includes 匹配）+ 横向滚动分类 Tab（含「全部」）+ 菜谱卡片 + 悬浮新增 FAB + 空状态
  - `pages/recipes/edit/edit.{ts,wxml,wxss}` — 新增/编辑表单：菜名 / 分类 picker（含「＋新增分类」走 wx.showModal editable）/ 食材动态行（名称·数量·单位，可增删）/ 做法 textarea（auto-height）
  - `utils/recipe.ts` — 新增 `CATEGORY_COLORS` 与 `categoryColor()` 供分类标签着色
- 设计上的要点
  - 列表页 `onShow` 重新读取数据并按当前筛选/搜索重建，保证从编辑页返回或 TabBar 切换后同步
  - 编辑页通过 `onLoad(options.id)` 区分新增/编辑，并用 `wx.setNavigationBarTitle` 动态改标题
  - 食材行编辑用 setData 路径 `ingredients[i].xxx` 局部更新；保存时过滤掉名称为空的行，数量统一 `Number() || 0`
  - 删除走 `wx.showModal`（confirmText=删除、confirmColor 红）二次确认后整体覆盖写回
  - 分类标签颜色与 app.wxss 调色板对齐，自定义分类灰色兜底
- 验证结果：✅ 用户确认菜谱库列表、筛选/搜索、新增/编辑、删除二次确认均正常（同时验证了 seed 数据与 Phase 2 逻辑层）

### 2026-06-12: Phase 4 库存页面完成 ✅
- 实现文件
  - `pages/inventory/inventory.{ts,wxml,wxss}` — 按存放位置分组（可折叠）；每项含名称 + 保质期标签 + 数量加减（圆形 ±）+ 单位 + 「需要购买」switch + 编辑/删除；悬浮新增 FAB + 空状态
  - `pages/inventory/edit/edit.{ts,wxml,wxss}` — 新增/编辑表单：名称（必填）/ 数量 / 单位 / 位置 picker（含「＋新增位置」）/ 保质期 date picker（可清除）
- 设计上的要点
  - 分组顺序：getLocations() 默认+自定义在前，库存中出现的其它位置（如已购买产生的「未分类」）追加在后；空组不展示
  - 折叠状态存在 Page 实例的 `collapsed` map 上（非 data），刷新时按 map 重建，保证加减/切换后折叠态不丢
  - 加减直接调 `adjustQty`（最小 0），needBuy 用原生 `switch` 的 bindchange 写回
  - 保质期标签：expired 红 / soon（3 天内）黄，正常不显示；颜色取自 app.wxss 调色板
  - 编辑历史食材时若其位置已不在选项列表中，自动补进 picker 选项避免丢失
- 待验证（微信开发者工具/真机）
  - 库存应按位置分组显示 seed 的 8 条；分组可折叠；± 改数量、需要购买开关、保质期标签（番茄/菠菜为近几天到期应显黄标）
  - 新增/编辑（含新增位置、选/清保质期）、删除二次确认均正常
