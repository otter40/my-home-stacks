// utils/stats.ts — 使用统计（基于 cookHistory）
import { CookRecord } from '../types/index';
import { getCookHistory, todayISO } from './storage';

/** 返回 n 天前的 ISO 日期 */
function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 区间内（含端点）的做菜记录 */
function inRange(records: CookRecord[], fromISO: string, toISO: string): CookRecord[] {
  return records.filter((r) => r.date >= fromISO && r.date <= toISO);
}

/** 最近 7 天做过的菜（含今天） */
export function weeklyCooked(): CookRecord[] {
  return inRange(getCookHistory(), daysAgoISO(6), todayISO());
}

/** 最近 30 天做过的菜（含今天） */
export function monthlyCooked(): CookRecord[] {
  return inRange(getCookHistory(), daysAgoISO(29), todayISO());
}

/** 高频菜排行（按出现次数降序） */
export function topDishes(limit = 5): Array<{ name: string; count: number }> {
  const counter = new Map<string, number>();
  for (const r of getCookHistory()) {
    counter.set(r.name, (counter.get(r.name) || 0) + 1);
  }
  return Array.from(counter.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** 总做菜次数 */
export function totalCooked(): number {
  return getCookHistory().length;
}
