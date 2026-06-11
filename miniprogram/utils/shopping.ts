// utils/shopping.ts — 购物袋业务逻辑（自动汇总 + 已购买处理）
import { Recipe, InventoryItem } from '../types/index';
import { getInventory, saveInventory, genId } from './storage';
import { normalizeName } from './recipe';
import { UNCLASSIFIED_LOCATION } from './inventory';

/** 自动汇总项来源 */
export type AutoSource = 'recipe' | 'needBuy';

/** 自动汇总的购物项（只读，由菜谱缺料和 needBuy 库存推导）*/
export interface AutoShoppingItem {
  name: string;
  qty?: number;
  unit?: string;
  sources: AutoSource[]; // 命中的来源，便于界面展示（可能同时来自菜谱与待购）
}

/**
 * 计算自动汇总项（参考 docs/spec.md §6.5）。
 * 来源：
 *  1) 所有 isToday === true 的菜谱中，库存里不存在或 qty <= 0 的食材
 *  2) 库存中 needBuy === true 的食材
 * 按食材名称（归一化）去重合并。
 */
export function getAutoItems(recipes: Recipe[], inventory: InventoryItem[]): AutoShoppingItem[] {
  const map = new Map<string, AutoShoppingItem>();

  const addOrMerge = (
    name: string,
    qty: number | undefined,
    unit: string | undefined,
    source: AutoSource
  ) => {
    const key = normalizeName(name);
    if (!key) return;
    const existing = map.get(key);
    if (existing) {
      if (!existing.sources.includes(source)) existing.sources.push(source);
      // 已有数量/单位则保留，缺失时补齐
      if (existing.qty === undefined && qty !== undefined) existing.qty = qty;
      if (!existing.unit && unit) existing.unit = unit;
    } else {
      map.set(key, { name: name.trim(), qty, unit, sources: [source] });
    }
  };

  // 来源 1：今天吃的菜谱缺少的食材
  for (const recipe of recipes) {
    if (!recipe.isToday) continue;
    for (const ing of recipe.ingredients) {
      const key = normalizeName(ing.name);
      const item = inventory.find((inv) => normalizeName(inv.name) === key);
      const available = !!item && item.qty > 0;
      if (!available) addOrMerge(ing.name, ing.qty, ing.unit, 'recipe');
    }
  }

  // 来源 2：库存中标记“需要购买”的食材
  for (const item of inventory) {
    if (item.needBuy) addOrMerge(item.name, undefined, item.unit, 'needBuy');
  }

  return Array.from(map.values());
}

/**
 * 执行“已购买”逻辑（参考 docs/spec.md §6.5）。
 * - 库存中已存在该食材 → 数量增加（增加值取该项 qty，无则 +1），并将 needBuy 置为 false
 * - 库存中不存在 → 新建库存记录（数量默认 qty 或 1，位置默认“未分类”）
 * 仅更新库存并写回，返回更新后的库存数组。
 * （从购物袋移除该项由调用方负责：手动项删存储、自动项随库存更新自然消失。）
 */
export function markAsPurchased(
  item: { name: string; qty?: number; unit?: string },
  inventory?: InventoryItem[]
): InventoryItem[] {
  const items = inventory ? inventory.slice() : getInventory();
  const key = normalizeName(item.name);
  const addQty = item.qty && item.qty > 0 ? item.qty : 1;
  const idx = items.findIndex((it) => normalizeName(it.name) === key);

  if (idx !== -1) {
    items[idx].qty += addQty;
    items[idx].needBuy = false;
  } else {
    items.push({
      id: genId(),
      name: item.name.trim(),
      qty: addQty,
      unit: item.unit || '',
      location: UNCLASSIFIED_LOCATION,
      expiry: null,
      needBuy: false,
    });
  }

  saveInventory(items);
  return items;
}
