// utils/recipe.ts — 菜谱业务逻辑（v2，主料匹配 + 做完扣减）
import { Recipe, StockItem, FridgeResult } from '../types/index';
import {
  getRecipes,
  saveRecipes,
  getStock,
  addCookRecord,
  genId,
  todayISO,
  getCustomOptions,
  saveCustomOptions,
} from './storage';
import { RECIPE_TYPES, CUISINES, PREP_OPTIONS, isSeasoningCategory } from '../constants/options';
import { ingredientName, stockTotalOf, getIngredient } from './ingredient';
import { deductForRecipe } from './stock';

// ---- 选项（默认 + 自定义）----
export function getRecipeTypes(): string[] {
  const custom = getCustomOptions().recipeTypes;
  const result = [...RECIPE_TYPES];
  for (const c of custom) if (!result.includes(c)) result.push(c);
  return result;
}
export function getCuisines(): string[] {
  const custom = getCustomOptions().cuisines;
  const result = [...CUISINES];
  for (const c of custom) if (!result.includes(c)) result.push(c);
  return result;
}
export function getPrepOptions(): string[] {
  return [...PREP_OPTIONS];
}
export function addRecipeType(name: string): string[] {
  const t = name.trim();
  if (t && !getRecipeTypes().includes(t)) {
    const opts = getCustomOptions();
    opts.recipeTypes.push(t);
    saveCustomOptions(opts);
  }
  return getRecipeTypes();
}
export function addCuisine(name: string): string[] {
  const t = name.trim();
  if (t && !getCuisines().includes(t)) {
    const opts = getCustomOptions();
    opts.cuisines.push(t);
    saveCustomOptions(opts);
  }
  return getCuisines();
}

/** 某食材分类的 main 默认值（调味/香料/佐料默认辅料） */
export function defaultMain(category: string): boolean {
  return !isSeasoningCategory(category);
}

/**
 * 冰箱可做状态（只看主料，参考 docs/spec.md §6.6）。
 * - 主料缺 0 → ok；缺 1–2 → almost；缺 ≥3 → no（不展示）
 * - 辅料缺失不影响判定，单独列在 missingOptional
 */
export function calcFridgeStatus(recipe: Recipe, stock?: StockItem[]): FridgeResult {
  const st = stock || getStock();
  const missingMain: string[] = [];
  const missingOptional: string[] = [];
  for (const ing of recipe.ingredients) {
    const enough = stockTotalOf(ing.ingredientId, st) > 0;
    if (enough) continue;
    const name = ingredientName(ing.ingredientId);
    if (ing.main) missingMain.push(name);
    else missingOptional.push(name);
  }
  let status: FridgeResult['status'];
  if (missingMain.length === 0) status = 'ok';
  else if (missingMain.length <= 2) status = 'almost';
  else status = 'no';
  return { status, missingMain, missingOptional };
}

/** 主料名称一览（卡片展示用） */
export function mainNames(recipe: Recipe): string[] {
  return recipe.ingredients
    .filter((i) => i.main)
    .map((i) => ingredientName(i.ingredientId));
}

/** 加入/移出今天想吃 */
export function setToday(id: string, value: boolean): Recipe[] {
  const recipes = getRecipes();
  const idx = recipes.findIndex((r) => r.id === id);
  if (idx !== -1) {
    recipes[idx].isToday = value;
    saveRecipes(recipes);
  }
  return recipes;
}

/**
 * 做完了：按用量从库存扣减（主+辅）、写入做菜历史、移出今天想吃。
 */
export function cookDone(recipe: Recipe): void {
  deductForRecipe(recipe);
  addCookRecord({ id: genId(), recipeId: recipe.id, name: recipe.name, date: todayISO() });
  setToday(recipe.id, false);
}

/** 校验菜谱食材引用是否仍有效（食材被删时提示用） */
export function hasDanglingIngredient(recipe: Recipe): boolean {
  return recipe.ingredients.some((i) => !getIngredient(i.ingredientId));
}
