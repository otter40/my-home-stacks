// utils/storage.ts — 本地存储读写封装
// 唯一允许调用 wx.setStorageSync / wx.getStorageSync 的地方。
// 页面层与其它 utils 一律通过本模块读写数据。

import { Recipe, InventoryItem, ShoppingItem } from '../types/index';

/** Storage Key 一览（参考 docs/architecture.md §3.1） */
export const KEYS = {
  recipes: 'recipes',
  inventory: 'inventory',
  shoppingItems: 'shoppingItems',
  customCategories: 'customCategories',
  customLocations: 'customLocations',
  initialized: 'initialized',
} as const;

/** 通用读取：key 不存在时返回传入的默认值，绝不抛异常 */
function read<T>(key: string, fallback: T): T {
  try {
    const v = wx.getStorageSync(key);
    if (v === '' || v === null || v === undefined) return fallback;
    return v as T;
  } catch (e) {
    console.error(`[storage] read "${key}" failed`, e);
    return fallback;
  }
}

/** 通用写入：整体覆盖写 */
function write<T>(key: string, value: T): void {
  try {
    wx.setStorageSync(key, value);
  } catch (e) {
    console.error(`[storage] write "${key}" failed`, e);
  }
}

// ---- 菜谱 ----
export function getRecipes(): Recipe[] {
  return read<Recipe[]>(KEYS.recipes, []);
}
export function saveRecipes(recipes: Recipe[]): void {
  write(KEYS.recipes, recipes);
}

// ---- 库存 ----
export function getInventory(): InventoryItem[] {
  return read<InventoryItem[]>(KEYS.inventory, []);
}
export function saveInventory(items: InventoryItem[]): void {
  write(KEYS.inventory, items);
}

// ---- 购物袋手动添加项 ----
export function getShoppingItems(): ShoppingItem[] {
  return read<ShoppingItem[]>(KEYS.shoppingItems, []);
}
export function saveShoppingItems(items: ShoppingItem[]): void {
  write(KEYS.shoppingItems, items);
}

// ---- 用户自定义菜谱分类 ----
export function getCustomCategories(): string[] {
  return read<string[]>(KEYS.customCategories, []);
}
export function saveCustomCategories(cats: string[]): void {
  write(KEYS.customCategories, cats);
}

// ---- 用户自定义存放位置 ----
export function getCustomLocations(): string[] {
  return read<string[]>(KEYS.customLocations, []);
}
export function saveCustomLocations(locs: string[]): void {
  write(KEYS.customLocations, locs);
}

// ---- 初始化标记 ----
export function isInitialized(): boolean {
  return read<boolean>(KEYS.initialized, false);
}
export function setInitialized(value: boolean): void {
  write(KEYS.initialized, value);
}

/** 生成唯一 ID（参考 docs/architecture.md §3.3，不依赖外部库） */
export function genId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}
