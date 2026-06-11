// utils/storage.ts — 本地存储读写封装（v2）
// 唯一允许调用 wx.setStorageSync / wx.getStorageSync 的地方。
import {
  Ingredient,
  Recipe,
  StockItem,
  ShoppingItem,
  CookRecord,
  CustomOptions,
} from '../types/index';

/** 当前数据结构版本（升级时若不一致则重置并重新写 seed） */
export const SCHEMA_VERSION = 2;

export const KEYS = {
  ingredients: 'ingredients',
  recipes: 'recipes',
  stock: 'stock',
  shoppingItems: 'shoppingItems',
  cookHistory: 'cookHistory',
  customOptions: 'customOptions',
  schemaVersion: 'schemaVersion',
  initialized: 'initialized',
} as const;

const EMPTY_CUSTOM: CustomOptions = {
  recipeTypes: [],
  cuisines: [],
  ingredientCategories: [],
  locations: [],
  stockStatuses: [],
};

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

function write<T>(key: string, value: T): void {
  try {
    wx.setStorageSync(key, value);
  } catch (e) {
    console.error(`[storage] write "${key}" failed`, e);
  }
}

// ---- 食材库 ----
export function getIngredients(): Ingredient[] {
  return read<Ingredient[]>(KEYS.ingredients, []);
}
export function saveIngredients(items: Ingredient[]): void {
  write(KEYS.ingredients, items);
}

// ---- 菜谱 ----
export function getRecipes(): Recipe[] {
  return read<Recipe[]>(KEYS.recipes, []);
}
export function saveRecipes(items: Recipe[]): void {
  write(KEYS.recipes, items);
}

// ---- 库存 ----
export function getStock(): StockItem[] {
  return read<StockItem[]>(KEYS.stock, []);
}
export function saveStock(items: StockItem[]): void {
  write(KEYS.stock, items);
}

// ---- 购物袋手动项 ----
export function getShoppingItems(): ShoppingItem[] {
  return read<ShoppingItem[]>(KEYS.shoppingItems, []);
}
export function saveShoppingItems(items: ShoppingItem[]): void {
  write(KEYS.shoppingItems, items);
}

// ---- 做菜历史 ----
export function getCookHistory(): CookRecord[] {
  return read<CookRecord[]>(KEYS.cookHistory, []);
}
export function saveCookHistory(items: CookRecord[]): void {
  write(KEYS.cookHistory, items);
}
export function addCookRecord(record: CookRecord): void {
  const list = getCookHistory();
  list.push(record);
  saveCookHistory(list);
}

// ---- 自定义选项 ----
export function getCustomOptions(): CustomOptions {
  return { ...EMPTY_CUSTOM, ...read<Partial<CustomOptions>>(KEYS.customOptions, {}) };
}
export function saveCustomOptions(opts: CustomOptions): void {
  write(KEYS.customOptions, opts);
}

// ---- 版本 / 初始化 ----
export function getSchemaVersion(): number {
  return read<number>(KEYS.schemaVersion, 0);
}
export function setSchemaVersion(v: number): void {
  write(KEYS.schemaVersion, v);
}
export function isInitialized(): boolean {
  return read<boolean>(KEYS.initialized, false);
}
export function setInitialized(value: boolean): void {
  write(KEYS.initialized, value);
}

/** 清空全部业务数据（保留无，连 initialized 一并清） */
export function clearAll(): void {
  Object.values(KEYS).forEach((k) => {
    try {
      wx.removeStorageSync(k);
    } catch (e) {
      console.error(`[storage] remove "${k}" failed`, e);
    }
  });
}

/** 生成唯一 ID（不依赖外部库） */
export function genId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}

/** 今天的 ISO 日期字符串（本地时区，YYYY-MM-DD） */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
