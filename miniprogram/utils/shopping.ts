// utils/shopping.ts — 购物袋业务逻辑（v2，基于 ingredientId）
import { Recipe, StockItem } from '../types/index';
import { getStock, saveStock, genId } from './storage';
import { ingredientName, stockTotalOf, findOrCreateByName, getIngredient } from './ingredient';
import { UNCLASSIFIED_LOCATION } from '../constants/options';

export type AutoSource = 'recipe' | 'needBuy';

/** 自动汇总项（只读） */
export interface AutoShoppingItem {
  ingredientId: string;
  name: string;
  qty?: number;
  unit?: string;
  sources: AutoSource[];
}

/**
 * 自动汇总（参考 docs/spec.md §6.5）：
 *  1) 所有 isToday 菜谱中库存合计 <= 0 的食材
 *  2) 库存中 needBuy === true 的食材
 * 按 ingredientId 去重合并。
 */
export function getAutoItems(recipes: Recipe[], stock: StockItem[]): AutoShoppingItem[] {
  const map = new Map<string, AutoShoppingItem>();

  const addOrMerge = (
    ingredientId: string,
    qty: number | undefined,
    unit: string | undefined,
    source: AutoSource
  ) => {
    const existing = map.get(ingredientId);
    if (existing) {
      if (!existing.sources.includes(source)) existing.sources.push(source);
      if (existing.qty === undefined && qty !== undefined) existing.qty = qty;
      if (!existing.unit && unit) existing.unit = unit;
    } else {
      map.set(ingredientId, {
        ingredientId,
        name: ingredientName(ingredientId),
        qty,
        unit,
        sources: [source],
      });
    }
  };

  // 来源 1：今天想吃的菜谱缺料（主 + 辅，库存合计 <= 0）
  for (const recipe of recipes) {
    if (!recipe.isToday) continue;
    for (const ing of recipe.ingredients) {
      if (stockTotalOf(ing.ingredientId, stock) <= 0) {
        addOrMerge(ing.ingredientId, ing.qty, ing.unit, 'recipe');
      }
    }
  }

  // 来源 2：库存标记“需要购买”
  for (const item of stock) {
    if (item.needBuy) addOrMerge(item.ingredientId, undefined, item.unit, 'needBuy');
  }

  return Array.from(map.values());
}

/**
 * 已购买入库（参考 docs/spec.md §6.6）。
 * item 可带 ingredientId（自动项），或仅名称（手动项 → 按名找/新建食材）。
 * 库存已有该食材则加量并清 needBuy，否则新建库存条目。返回更新后的库存。
 */
export function markAsPurchased(item: {
  ingredientId?: string;
  name: string;
  qty?: number;
  unit?: string;
}): StockItem[] {
  const ingredient = item.ingredientId
    ? getIngredient(item.ingredientId) || findOrCreateByName(item.name, item.unit)
    : findOrCreateByName(item.name, item.unit);

  const items = getStock();
  const addQty = item.qty && item.qty > 0 ? item.qty : 1;
  const idx = items.findIndex((s) => s.ingredientId === ingredient.id);

  if (idx !== -1) {
    items[idx].qty += addQty;
    items[idx].needBuy = false;
  } else {
    items.push({
      id: genId(),
      ingredientId: ingredient.id,
      qty: addQty,
      unit: item.unit || ingredient.defaultUnit || '',
      location: UNCLASSIFIED_LOCATION,
      expiry: null,
      statuses: [],
      needBuy: false,
    });
  }

  saveStock(items);
  return items;
}
