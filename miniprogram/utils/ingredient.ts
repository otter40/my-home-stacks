// utils/ingredient.ts — 食材库业务逻辑
import { Ingredient, Recipe, StockItem } from '../types/index';
import {
  getIngredients,
  saveIngredients,
  getRecipes,
  getStock,
  genId,
} from './storage';
import { INGREDIENT_CATEGORIES, UNCLASSIFIED_CATEGORY } from '../constants/options';
import { getCustomOptions, saveCustomOptions } from './storage';

/** 名称归一化（去空格 + 小写），用于按名查找/去重 */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/** 食材分类（默认 + 自定义） */
export function getIngredientCategories(): string[] {
  const custom = getCustomOptions().ingredientCategories;
  const result = [...INGREDIENT_CATEGORIES];
  for (const c of custom) if (!result.includes(c)) result.push(c);
  return result;
}

export function addIngredientCategory(name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed || getIngredientCategories().includes(trimmed)) {
    return getIngredientCategories();
  }
  const opts = getCustomOptions();
  opts.ingredientCategories.push(trimmed);
  saveCustomOptions(opts);
  return getIngredientCategories();
}

export function getIngredient(id: string): Ingredient | undefined {
  return getIngredients().find((i) => i.id === id);
}

/** 取食材名（找不到返回兜底文案，避免界面空白） */
export function ingredientName(id: string): string {
  const ing = getIngredient(id);
  return ing ? ing.name : '(已删除食材)';
}

/** 新增或更新食材，返回保存后的列表 */
export function upsertIngredient(ing: Ingredient): Ingredient[] {
  const list = getIngredients();
  const idx = list.findIndex((i) => i.id === ing.id);
  if (idx === -1) list.push(ing);
  else list[idx] = ing;
  saveIngredients(list);
  return list;
}

/** 按名称查找，找不到则新建（已购买/手动项落库时用） */
export function findOrCreateByName(name: string, defaultUnit?: string): Ingredient {
  const key = normalizeName(name);
  const existing = getIngredients().find((i) => normalizeName(i.name) === key);
  if (existing) return existing;
  const created: Ingredient = {
    id: genId(),
    name: name.trim(),
    category: UNCLASSIFIED_CATEGORY,
    defaultUnit,
  };
  upsertIngredient(created);
  return created;
}

/** 删除食材；返回该食材是否被库存/菜谱引用（被引用时不删，交调用方提示） */
export function removeIngredient(id: string): { removed: boolean; usedByStock: boolean; usedByRecipes: number } {
  const usedByStock = getStock().some((s) => s.ingredientId === id);
  const usedByRecipes = recipesUsing(id).length;
  if (usedByStock || usedByRecipes > 0) {
    return { removed: false, usedByStock, usedByRecipes };
  }
  saveIngredients(getIngredients().filter((i) => i.id !== id));
  return { removed: true, usedByStock: false, usedByRecipes: 0 };
}

/** 按食材分类分组（仅含有食材的分类，按分类选项顺序） */
export function groupByCategory(): Array<{ category: string; items: Ingredient[] }> {
  const items = getIngredients();
  const order = getIngredientCategories();
  for (const it of items) if (!order.includes(it.category)) order.push(it.category);
  const groups: Array<{ category: string; items: Ingredient[] }> = [];
  for (const cat of order) {
    const list = items.filter((i) => i.category === cat);
    if (list.length > 0) groups.push({ category: cat, items: list });
  }
  return groups;
}

/** 反向关联：引用该食材的菜谱 */
export function recipesUsing(id: string): Recipe[] {
  return getRecipes().filter((r) => r.ingredients.some((ing) => ing.ingredientId === id));
}

/** 该食材当前库存合计数量 */
export function stockTotalOf(id: string, stock?: StockItem[]): number {
  return (stock || getStock())
    .filter((s) => s.ingredientId === id)
    .reduce((sum, s) => sum + s.qty, 0);
}
