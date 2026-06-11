// types/index.ts — 全局 TypeScript 数据结构定义
// 参考 docs/spec.md §4

/** 菜谱中的食材条目 */
export interface Ingredient {
  /** 食材名称，需与 InventoryItem.name 精确匹配（去首尾空格、不区分大小写） */
  name: string;
  /** 数量 */
  qty: number;
  /** 单位（个 / g / 把 / 勺 等） */
  unit: string;
}

/** 菜谱 */
export interface Recipe {
  id: string;
  /** 菜名 */
  name: string;
  /** 分类（荤菜 / 素菜 / 汤羹 / 主食 / 其他，可自定义新增） */
  category: string;
  /** 所需食材列表 */
  ingredients: Ingredient[];
  /** 做法（可选，纯文本） */
  steps?: string;
  /** 是否在"今天吃"列表中 */
  isToday: boolean;
}

/** 库存食材（食材库与库存合并为一张表） */
export interface InventoryItem {
  id: string;
  /** 食材名称 */
  name: string;
  /** 当前数量 */
  qty: number;
  /** 单位 */
  unit: string;
  /** 存放位置（冷藏 / 冷冻 / 常温 / 调料区，可自定义新增） */
  location: string;
  /** 到期日，ISO 日期字符串（YYYY-MM-DD），可选 */
  expiry?: string | null;
  /** 是否标记"需要购买" */
  needBuy: boolean;
}

/** 购物袋手动添加项 */
export interface ShoppingItem {
  id: string;
  name: string;
  qty?: number;
  unit?: string;
}

/** 冰箱推荐：单个菜谱的可做状态 */
export type FridgeStatus = 'ok' | 'almost' | 'no';

/** 保质期状态 */
export type ExpiryStatus = 'expired' | 'soon' | 'ok';

/** 单个食材在库存中的匹配结果 */
export interface IngredientMatch {
  name: string;
  qty: number;     // 菜谱所需数量
  unit: string;
  available: boolean; // 库存中存在且 qty > 0
  haveQty: number;    // 库存现有数量（0 表示没有）
}

/** 菜谱在当前库存下的可做状态结果 */
export interface FridgeResult {
  status: FridgeStatus;
  missing: string[];           // 缺少的食材名称列表
  matches: IngredientMatch[];  // 每个食材的逐项匹配
}
