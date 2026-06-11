# CLAUDE.md — 王家今天吃什么 微信小程序

## 项目简介

将 Notion 工作区"👑 王家今天吃什么"的核心功能改造为**微信小程序**。
帮助家庭管理冰箱库存、菜谱，自动推荐今天能做什么菜，并生成购物清单。

## 关键约束（开发前必读）

| 约束项 | 说明 |
|--------|------|
| 平台 | 微信小程序 |
| 开发模板 | TS-基础模版（TypeScript，普通渲染模式） |
| 渲染引擎 | **不使用 Skyline**，使用默认渲染模式 |
| 样式 | **不使用 Sass / Less**，只写原生 wxss |
| 数据存储 | **只用本地存储**（`wx.setStorageSync` / `wx.getStorageSync`），不接云开发、不接后端 |
| 账号体系 | 无，完全独立运行，每台设备数据互不共享 |
| 操作端 | 用户全程只用手机操作，不依赖电脑 |

## 文档导航

```
CLAUDE.md              ← 你在这里，总入口
docs/
  spec.md              ← 完整需求与业务逻辑
  architecture.md      ← 数据结构、存储方案、模块划分
  task.md              ← 开发任务清单（按阶段）
```

## 项目目录结构（目标）

```
miniprogram/
  pages/
    today/             ← 今天吃
    fridge/            ← 冰箱能做什么
    recipes/           ← 菜谱库
    inventory/         ← 库存
    shopping/          ← 购物袋
  utils/
    storage.ts         ← 本地存储读写封装
    recipe.ts          ← 菜谱相关业务逻辑
    inventory.ts       ← 库存相关业务逻辑
    shopping.ts        ← 购物袋相关业务逻辑
    seed.ts            ← 初始示例数据
  types/
    index.ts           ← 所有 TypeScript interface 定义
  app.ts
  app.json            ← TabBar 配置（5个tab）
  app.wxss            ← 全局样式变量
```

## 开发注意事项

- **数据操作统一走 `utils/storage.ts`**，不要在页面里直接调用 `wx.setStorageSync`
- **食材名称匹配**：去除首尾空格，字符串精确匹配（不区分大小写）
- **首次启动**：检测本地无数据时，自动写入 `utils/seed.ts` 中的示例数据
- **TabBar 图标**：使用 emoji 或内联 SVG，避免依赖外部图片资源
- **样式**：全局色彩变量定义在 `app.wxss`，各页面引用变量，不要写 magic color 值
- **删除操作**：所有删除必须有二次确认（`wx.showModal`）

## 默认数据说明

初始菜谱分类（固定选项，用户可新增）：荤菜 / 素菜 / 汤羹 / 主食 / 其他

库存存放位置（固定选项，用户可新增）：冷藏 / 冷冻 / 常温 / 调料区

详见 `docs/spec.md` 和 `utils/seed.ts`。

## 对话结束需要确认

需在微信开发者工具中确认时，请给出总结了这次修改的commit信息。