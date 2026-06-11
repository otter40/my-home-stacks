// types/index.ts — 全局数据结构定义（v2，参考 docs/spec.md §4）

/** 🥕 食材库目录条目 */
export interface Ingredient {
  id: string;
  name: string;
  category: string;       // 食材分类（单选）
  defaultUnit?: string;   // 默认单位（建库存/菜谱时带出，可选）
}

/** 菜谱中的食材引用行（引用食材库） */
export interface RecipeIngredient {
  ingredientId: string;   // 引用 Ingredient.id
  qty: number;
  unit: string;
  main: boolean;          // 是否主料（冰箱建议只看主料）
}

/** 📖 菜谱 */
export interface Recipe {
  id: string;
  name: string;
  types: string[];        // 类型（多选）
  cuisines: string[];     // 菜系（多选）
  prep: string;           // 提前备菜（单选）
  ingredients: RecipeIngredient[];
  steps?: string;         // 做法（可选）
  isToday: boolean;       // 是否在"今天想吃"中
}

/** 🛖 库存（家里实际存货） */
export interface StockItem {
  id: string;
  ingredientId: string;   // 引用 Ingredient.id
  qty: number;
  unit: string;
  location: string;       // 存放位置（单选，可自定义）
  expiry?: string | null; // 到期日 ISO（YYYY-MM-DD），可选
  statuses: string[];     // 状态（多选）
  needBuy: boolean;       // 标记需要购买
}

/** 🛒 购物袋手动添加项 */
export interface ShoppingItem {
  id: string;
  name: string;
  qty?: number;
  unit?: string;
  ingredientId?: string;  // 若关联到食材库（可选）
}

/** 做菜历史（用于使用统计） */
export interface CookRecord {
  id: string;
  recipeId: string;
  name: string;           // 冗余菜名，避免菜谱删除后丢失
  date: string;           // ISO 日期 YYYY-MM-DD
}

/** 用户自定义选项（分类/标签管理） */
export interface CustomOptions {
  recipeTypes: string[];
  cuisines: string[];
  ingredientCategories: string[];
  locations: string[];
  stockStatuses: string[];
}

/** 保质期状态 */
export type ExpiryStatus = 'expired' | 'soon' | 'ok';

/** 冰箱可做状态 */
export type FridgeStatus = 'ok' | 'almost' | 'no';

/** 菜谱在当前库存下的可做结果（基于主料） */
export interface FridgeResult {
  status: FridgeStatus;
  missingMain: string[];     // 缺少的主料名称
  missingOptional: string[]; // 缺少的辅料名称（不影响可做判定）
}
