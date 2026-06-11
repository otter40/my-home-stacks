// utils/stock.ts — 库存业务逻辑（v2，替换 inventory.ts）
import { StockItem, ExpiryStatus, Recipe } from '../types/index';
import {
  getStock,
  saveStock,
  getCustomOptions,
  saveCustomOptions,
} from './storage';
import { DEFAULT_LOCATIONS, STOCK_STATUSES } from '../constants/options';

// ---- 位置选项 ----
export function getLocations(): string[] {
  const custom = getCustomOptions().locations;
  const result = [...DEFAULT_LOCATIONS];
  for (const l of custom) if (!result.includes(l)) result.push(l);
  return result;
}
export function addLocation(name: string): string[] {
  const t = name.trim();
  if (t && !getLocations().includes(t)) {
    const opts = getCustomOptions();
    opts.locations.push(t);
    saveCustomOptions(opts);
  }
  return getLocations();
}

// ---- 状态选项 ----
export function getStatuses(): string[] {
  const custom = getCustomOptions().stockStatuses;
  const result = [...STOCK_STATUSES];
  for (const s of custom) if (!result.includes(s)) result.push(s);
  return result;
}
export function addStatus(name: string): string[] {
  const t = name.trim();
  if (t && !getStatuses().includes(t)) {
    const opts = getCustomOptions();
    opts.stockStatuses.push(t);
    saveCustomOptions(opts);
  }
  return getStatuses();
}

/**
 * 保质期状态（参考 docs/spec.md）：
 * - 到期日早于今天 → expired
 * - 3 天内（含今天）→ soon
 * - 其它 / 无 → ok
 */
export function getExpiryStatus(item: StockItem): ExpiryStatus {
  if (!item.expiry) return 'ok';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(`${item.expiry}T00:00:00`);
  if (isNaN(exp.getTime())) return 'ok';
  const diffDays = Math.floor((exp.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'soon';
  return 'ok';
}

/** 数量加减（最小 0），返回更新后的库存 */
export function adjustQty(id: string, delta: number): StockItem[] {
  const items = getStock();
  const idx = items.findIndex((it) => it.id === id);
  if (idx === -1) return items;
  items[idx].qty = Math.max(0, items[idx].qty + delta);
  saveStock(items);
  return items;
}

/** 按钮式切换"需要购买"，返回更新后的库存 */
export function toggleNeedBuy(id: string): StockItem[] {
  const items = getStock();
  const idx = items.findIndex((it) => it.id === id);
  if (idx === -1) return items;
  items[idx].needBuy = !items[idx].needBuy;
  saveStock(items);
  return items;
}

/**
 * 做完了扣减库存（参考 docs/spec.md §6.6）。
 * 遍历菜谱全部食材，按 ingredientId 找库存，按到期日升序（无到期日最后）依次扣减至 0。
 */
export function deductForRecipe(recipe: Recipe): StockItem[] {
  const items = getStock();
  for (const ing of recipe.ingredients) {
    let remaining = ing.qty;
    if (remaining <= 0) continue;
    const entries = items
      .filter((s) => s.ingredientId === ing.ingredientId)
      .sort((a, b) => {
        const ea = a.expiry || '9999-12-31';
        const eb = b.expiry || '9999-12-31';
        return ea < eb ? -1 : ea > eb ? 1 : 0;
      });
    for (const entry of entries) {
      if (remaining <= 0) break;
      const d = Math.min(remaining, entry.qty);
      entry.qty -= d;
      remaining -= d;
    }
  }
  saveStock(items);
  return items;
}
