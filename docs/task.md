# Tasks (v2)

> v2 改造：食材库/库存拆分并完整关联、菜谱分类升级为多字段、今天吃+冰箱合并进首页、
> 购物袋改子页面、新增"我的"管理页、UI 改 Notion 浅色风。
> v1 各阶段记录见文末「Done（历史）」。

## Phase A — 数据模型与逻辑层重构

- [X] 重写 `types/index.ts`：Ingredient / RecipeIngredient / Recipe(types/cuisines/prep) / StockItem(statuses) / ShoppingItem / CookRecord / CustomOptions
- [X] 新增 `constants/options.ts`：RECIPE_TYPES / CUISINES / PREP_OPTIONS / INGREDIENT_CATEGORIES / STOCK_STATUSES / 默认 LOCATIONS + isSeasoningCategory
- [X] 重写 `utils/storage.ts`：新 key 集合 + `customOptions` + `cookHistory` + SCHEMA_VERSION + clearAll + todayISO
- [X] 重写 `utils/seed.ts`：buildSeed() 先建食材库（9）→ 库存（8，引用）→ 菜谱（5，引用，含 main 标记）
- [X] 新增 `utils/ingredient.ts`：增删改、按分类分组、`recipesUsing`、`stockTotalOf`、`findOrCreateByName`、引用拦截删除
- [X] 重写 `utils/recipe.ts`：选项合并、`defaultMain`、`calcFridgeStatus`(主料)、`setToday`、`cookDone`
- [X] 重写 `utils/stock.ts`（替换 inventory.ts）：位置/状态选项、保质期、加减、`toggleNeedBuy`、`deductForRecipe`
- [X] 重写 `utils/shopping.ts`：自动汇总（基于 ingredientId）、已购买入库（关联/新建食材）
- [X] 新增 `utils/stats.ts`：weeklyCooked / monthlyCooked / topDishes / totalCooked
- [X] `app.ts`：schema 版本检查 + 首次/升级写 seed（导出 writeSeed 供"我的"页复用）

## Phase B — Notion 浅色 UI 框架

- [X] 重写 `app.wxss`：Notion 浅色调色板 + 通用组件样式（.card / .section-title / .chip / 按钮 / .empty / .fab）
- [X] 重写 `app.json`：TabBar 改为 首页/库存/菜谱/食材/我的，注册全部页面与子页面
- [X] 清理旧页面目录（today / fridge / inventory / 旧 recipes / 旧 shopping），建立 9 个新页面骨架

## Phase C — 首页

- [X] `pages/home/home`：欢迎条 + 今天想吃（卡片 + 做完了扣减）+ 冰箱建议（只看主料，加入想吃）+ 购物袋摘要入口

## Phase D — 库存页

- [X] `pages/stock/stock`：按位置分组（可折叠）、状态多选标签、保质期标签、± 加减、按钮式"需要购买"
- [X] `pages/stock/edit`：选食材库食材/新建、数量、单位、位置、保质期、状态多选；删除二次确认

## Phase E — 菜谱页

- [ ] `pages/recipes/recipes`：类型/菜系筛选 + 菜名搜索 + 卡片「加入今天吃」按钮
- [ ] `pages/recipes/edit`：类型(多选)/菜系(多选)/提前备菜(单选) + 从食材库选食材(含主料开关)动态行 + 做法；删除二次确认

## Phase F — 食材页

- [ ] `pages/ingredients/ingredients`：按食材分类分组罗列；点击查看库存合计 + 反向关联菜谱
- [ ] `pages/ingredients/edit`：名称、分类(支持新增)、默认单位；删除二次确认（含引用提示）

## Phase G — 购物袋子页 + 我的页

- [ ] `pages/shopping/shopping`：自动汇总 + 手动添加 + 已购买入库 + 删除（从首页入口进入）
- [ ] `pages/profile/profile`：数据导出/导入、分类标签管理、清空/重置、使用统计

## Phase H — 整体打磨

- [ ] onShow 同步核对、空状态文案统一、样式变量一致性、真机完整流程走查

## Done（v2）

### 2026-06-12: Phase A 数据/逻辑层 + Phase B UI 框架完成 ✅
- Phase A（纯逻辑）
  - types：Ingredient / RecipeIngredient(含 main) / Recipe(types/cuisines/prep) / StockItem(statuses) / ShoppingItem / CookRecord / CustomOptions / FridgeResult
  - constants/options.ts：全部默认选项 + isSeasoningCategory（调味/香料/佐料 → 默认辅料）
  - storage.ts：8 个 key + SCHEMA_VERSION=2 + clearAll + todayISO；ingredient/recipe/stock/shopping 各 utils 按 ingredientId 关联
  - 关键算法：calcFridgeStatus 只看主料、deductForRecipe 按到期日升序扣减、markAsPurchased 入库（必要时新建食材）、cookDone 串联扣减+历史+移出
  - app.ts：onLaunch 检测 schemaVersion，不一致即 clearAll + writeSeed（已与用户确认本地无数据保留）
  - 导入图无环：recipe→stock/ingredient，二者不反向依赖
- Phase B（UI 框架）
  - app.wxss 改 Notion 浅色（白/浅灰、细分割线、chip 标签、低调蓝强调、弱阴影）
  - app.json TabBar：🏠首页 / 🧊库存 / 📖菜谱 / 🥕食材 / 👤我的；购物袋等为子页面
  - 删除旧 5 页，新建 9 个页面骨架（占位空状态），项目可重新编译启动
- 待验证（微信开发者工具）
  - 因数据结构升级，重新编译后会自动 clearAll 并写入 v2 seed（schemaVersion 0/1 → 2）
  - 底部 5 个新 tab 可切换、各页显示占位；Storage 面板应见 ingredients(9)/stock(8)/recipes(5)/schemaVersion=2
- 说明：各页功能将在 Phase C–G 实现并逐页验证
- 验证结果：✅ 用户确认重新编译后正常启动、5 个新 tab 与占位均正常（seed 自动升级到 v2）

### 2026-06-12: Phase C 首页完成 ✅
- 实现文件：`pages/home/home.{ts,wxml,wxss}`
- 内容
  - 欢迎条：应用名 + 日期（含周几）+ 问候
  - 今天想吃：isToday 菜谱卡片（类型/提前备菜 chip + 主料一览），「✅ 做完了」调 cookDone（扣库存+写历史+移出），可「移出」；空时折叠为引导行
  - 冰箱建议（始终在下方）：calcFridgeStatus 只看主料，分「可以做」（加入想吃，已加入则禁用）/「差一点点」（列缺失主料）
  - 购物袋摘要卡：待买项数 + 前 3 项预览 + 「去购物袋 ›」navigateTo 子页面
  - onShow 刷新，与库存/菜谱/购物联动
- 待验证：首次 seed 下「可以做」应含番茄炒蛋/蒜蓉炒菠菜/紫菜蛋花汤/土豆炖鸡（大蒜是辅料不影响蒜蓉炒菠菜），白米饭在「差一点点」；加入想吃→上移今天想吃；做完了→今天想吃移除且库存对应食材扣减
- 验证结果：✅ 用户确认首页联动正常

### 2026-06-12: Phase D 库存页完成 ✅
- 实现文件：`pages/stock/stock.{ts,wxml,wxss}` + `pages/stock/edit/edit.{ts,wxml,wxss}`
- 列表：按位置分组（折叠态存 Page 实例）、食材名经 ingredientName 映射、保质期 chip、状态多选 chip、圆角 ± 加减、**按钮式「需要购买」**（替换 switch，选中态高亮）、编辑/删除（二次确认）
- 编辑：从食材库 picker 选食材（显示「分类 名称」）/「＋新建食材」(findOrCreateByName)、数量/单位（选食材自动带默认单位）、位置 picker（含新增）、保质期 date picker（可清除）、状态多选 chip
- 待验证：库存按位置分组显示 seed 8 条；菠菜/紫菜带状态 chip、番茄/菠菜近期到期显黄标；按钮式需购买可切换；新增（选/新建食材）、编辑、删除正常

## Done（历史）

### v1（已被 v2 取代，记录留档）

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
- 验证结果：✅ 用户确认库存分组/折叠、加减、需要购买开关、保质期标签、新增/编辑/删除二次确认均正常

### 2026-06-12: Phase 5 今天吃页面完成 ✅
- 实现文件：`pages/today/today.{ts,wxml,wxss}`
- 内容
  - 展示所有 `isToday === true` 的菜谱卡片（菜名 + 彩色分类标签 + 食材列表，食材带数量单位 `名称 数量单位`）
  - 「✅ 做完了」按钮：将该菜 `isToday` 置 false 并写回，列表即时移除，toast 提示
  - 空状态：两个引导按钮 `wx.switchTab` 跳「冰箱能做什么」/「菜谱库」
  - onShow 重新读取，保证从冰箱页「加入今天吃」后切回即时显示
- 待验证（微信开发者工具/真机）
  - 默认 seed 菜谱 isToday 均为 false，故首次进入应显示空状态 + 两个引导按钮
  - 在冰箱页「加入今天吃」或后续手动置 isToday 后，今天吃应出现对应卡片；点「做完了」后卡片消失

### 2026-06-12: Phase 6 冰箱能做什么页面完成 ✅
- 实现文件：`pages/fridge/fridge.{ts,wxml,wxss}`
- 内容
  - 用 `calcFridgeStatus(recipe, inventory)` 对每个菜谱算可做状态
  - 分两组：「可以做」(status=ok，绿点) / 「差一点点」(status=almost 缺 1–2 项，黄点)；status=no（缺 ≥3）不展示
  - 可以做卡片：菜名 + 分类标签 + 食材齐全列表 + 「加入今天吃」按钮（已加入则禁用显示「已加入今天吃」）
  - 差一点点卡片：显示「还差：xxx、yyy」缺料列表（文字用深琥珀 #C98A00 保证对比度）
  - 两组都为空时空状态引导
- 设计上的要点
  - 「加入今天吃」置 isToday=true 写回并 refresh，与 Phase 5 今天吃页打通；已是 isToday 的按钮禁用避免重复
  - onShow 刷新，库存变化（加减/删除）后切回冰箱页可做状态即时重算
- 验证联动建议：seed 默认「番茄炒蛋/蒜蓉炒菠菜/紫菜蛋花汤/土豆炖鸡」应在「可以做」，「白米饭」缺大米应在「差一点点」；点「加入今天吃」后切到今天吃页应出现，做完了后消失
- 验证结果：✅ 用户确认冰箱页可做/差一点点分组、加入今天吃联动、今天吃做完了均正常

### 2026-06-12: Phase 7 购物袋页面完成 ✅
- 实现文件：`pages/shopping/shopping.{ts,wxml,wxss}`
- 内容
  - 顶部手动添加栏（名称必填 + 数量 + 单位 → 新建 ShoppingItem 存 shoppingItems）
  - 「自动汇总」区（只读）：`getAutoItems(recipes, inventory)` 结果，标注来源（今天吃缺料 / 库存待购 / 两者）
  - 「手动添加」区：可「已购买」+ 可「删除」（删除走 wx.showModal 二次确认）
  - 「已购买」：调 `markAsPurchased` 更新/新建库存；手动项额外从 shoppingItems 移除；自动项随库存更新自然消失；wx.showToast 轻提示
  - 两区皆空时空状态
- 设计上的要点
  - 自动项「已购买」无需手动删——markAsPurchased 后库存 qty>0 / needBuy=false，下次 getAutoItems 不再产出
  - 手动项 qty/unit 可空：表单留空则存 undefined，购买时 markAsPurchased 默认 +1
  - 自动项 wx:key 用归一化后唯一的 name；onShow 刷新保证与今天吃/库存改动同步
- 待验证（微信开发者工具/真机）
  - 把某库存项标「需要购买」→ 购物袋自动汇总出现「库存待购」；今天吃加入缺料菜谱 → 出现「今天吃缺料」
  - 手动添加、已购买（确认库存数量增加/新建「未分类」）、删除二次确认均正常

### 2026-06-12: Phase 8 整体打磨（代码侧）✅
- onShow 数据同步：5 个 TabBar 页（today/fridge/recipes/inventory/shopping）均在 onShow 重新读取并重建列表；2 个 edit 子页用 onLoad（每次 navigateTo 全新进入，正确）
- 空状态统一：各页空状态统一复用 app.wxss 的 `.empty / .empty__emoji / .empty__hint`，文案均带引导
- 去除 magic color：新增全局变量 `--color-white`、`--color-warn-text`、`--color-warn-text-strong`、`--shadow-fab`；将各页 wxss 中的 `#fff`、`#C98A00`、`#7a5a00`、FAB 阴影 rgba 全部改为变量引用；grep 确认 pages 下已无裸 hex/rgba
- 剩余：真机完整流程走查由用户执行（最后一项）
