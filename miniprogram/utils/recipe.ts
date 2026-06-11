// utils/recipe.ts — 菜谱相关业务逻辑
import { Recipe, InventoryItem, IngredientMatch, FridgeResult } from '../types/index';
import { getCustomCategories, saveCustomCategories } from './storage';

/** 默认菜谱分类（固定，用户可新增）*/
export const DEFAULT_CATEGORIES = ['荤菜', '素菜', '汤羹', '主食', '其他'];

/** 分类标签配色（与 app.wxss 调色板一致；未知/自定义分类用灰色兜底）*/
export const CATEGORY_COLORS: Record<string, string> = {
  荤菜: '#F4845F',
  素菜: '#6DBF86',
  汤羹: '#F9C74F',
  主食: '#C89B7B',
  其他: '#9AA0A6',
};

/** 返回分类对应的标签颜色 */
export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#9AA0A6';
}

/** 食材名称归一化：去首尾空格 + 转小写，用于精确匹配 */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/** 返回默认分类 + 用户自定义分类的合并列表（去重，保持默认在前）*/
export function getCategories(): string[] {
  const custom = getCustomCategories();
  const result = [...DEFAULT_CATEGORIES];
  for (const c of custom) {
    if (!result.includes(c)) result.push(c);
  }
  return result;
}

/**
 * 新增自定义分类。
 * 去首尾空格；为空或已存在（与现有分类完全相同）则不重复添加。
 * 返回新增后的完整分类列表。
 */
export function addCategory(name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed) return getCategories();
  if (getCategories().includes(trimmed)) return getCategories();
  const custom = getCustomCategories();
  custom.push(trimmed);
  saveCustomCategories(custom);
  return getCategories();
}

/**
 * 计算某菜谱的每个食材在库存中的匹配状态。
 * 匹配规则：名称去首尾空格、不区分大小写精确匹配，且库存数量 > 0 视为可用。
 */
export function matchIngredients(recipe: Recipe, inventory: InventoryItem[]): IngredientMatch[] {
  return recipe.ingredients.map((ing) => {
    const key = normalizeName(ing.name);
    const item = inventory.find((inv) => normalizeName(inv.name) === key);
    const haveQty = item ? item.qty : 0;
    return {
      name: ing.name,
      qty: ing.qty,
      unit: ing.unit,
      available: !!item && item.qty > 0,
      haveQty,
    };
  });
}

/**
 * 计算菜谱的可做状态（参考 docs/architecture.md §6）。
 * - 全部食材满足 → 'ok'
 * - 缺 1–2 项 → 'almost'
 * - 缺 3 项及以上 → 'no'
 */
export function calcFridgeStatus(recipe: Recipe, inventory: InventoryItem[]): FridgeResult {
  const matches = matchIngredients(recipe, inventory);
  const missing = matches.filter((m) => !m.available).map((m) => m.name);
  let status: FridgeResult['status'];
  if (missing.length === 0) status = 'ok';
  else if (missing.length <= 2) status = 'almost';
  else status = 'no';
  return { status, missing, matches };
}
