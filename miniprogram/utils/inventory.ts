// utils/inventory.ts — 库存相关业务逻辑
import { InventoryItem, ExpiryStatus } from '../types/index';
import {
  getCustomLocations,
  saveCustomLocations,
  getInventory,
  saveInventory,
} from './storage';

/** 默认存放位置（固定，用户可新增）*/
export const DEFAULT_LOCATIONS = ['冷藏', '冷冻', '常温', '调料区'];

/** 已购买但未分类时使用的兜底位置 */
export const UNCLASSIFIED_LOCATION = '未分类';

/** 返回默认位置 + 用户自定义位置的合并列表（去重，保持默认在前）*/
export function getLocations(): string[] {
  const custom = getCustomLocations();
  const result = [...DEFAULT_LOCATIONS];
  for (const l of custom) {
    if (!result.includes(l)) result.push(l);
  }
  return result;
}

/**
 * 新增自定义存放位置。
 * 去首尾空格；为空或已存在则不重复添加。返回新增后的完整位置列表。
 */
export function addLocation(name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed) return getLocations();
  if (getLocations().includes(trimmed)) return getLocations();
  const custom = getCustomLocations();
  custom.push(trimmed);
  saveCustomLocations(custom);
  return getLocations();
}

/**
 * 计算食材保质期状态（参考 docs/spec.md §6.4）。
 * - 已过期（到期日早于今天）→ 'expired'
 * - 3 天内到期（含今天）→ 'soon'
 * - 其它 / 无到期日 → 'ok'
 */
export function getExpiryStatus(item: InventoryItem): ExpiryStatus {
  if (!item.expiry) return 'ok';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // 以本地时区零点解析，避免 'YYYY-MM-DD' 被当成 UTC
  const exp = new Date(`${item.expiry}T00:00:00`);
  if (isNaN(exp.getTime())) return 'ok';
  const diffDays = Math.floor((exp.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'soon';
  return 'ok';
}

/**
 * 库存数量加减（数量最小为 0）。
 * 读取库存 → 修改对应项 → 整体写回，返回更新后的库存数组。
 */
export function adjustQty(id: string, delta: number): InventoryItem[] {
  const items = getInventory();
  const idx = items.findIndex((it) => it.id === id);
  if (idx === -1) return items;
  items[idx].qty = Math.max(0, items[idx].qty + delta);
  saveInventory(items);
  return items;
}
