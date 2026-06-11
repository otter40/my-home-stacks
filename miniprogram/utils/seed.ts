// utils/seed.ts — 首次启动/重置写入的示例数据（v2，参考 docs/spec.md §5）
// 顺序：先建食材库，再建库存与菜谱（均引用食材库 id）。
import { Ingredient, Recipe, StockItem } from '../types/index';
import { genId } from './storage';
import { isSeasoningCategory } from '../constants/options';

/** 从今天偏移 days 天的 ISO 日期 */
function dateFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface SeedData {
  ingredients: Ingredient[];
  stock: StockItem[];
  recipes: Recipe[];
}

/** 构建整套示例数据（一次性生成，保证引用一致、id 唯一） */
export function buildSeed(): SeedData {
  // 1) 食材库
  const defs: Array<{ name: string; category: string; unit: string }> = [
    { name: '番茄', category: '🥬蔬菜', unit: '个' },
    { name: '鸡蛋', category: '🥚蛋奶', unit: '个' },
    { name: '菠菜', category: '🥬蔬菜', unit: '把' },
    { name: '大蒜', category: '🧄佐料', unit: '瓣' },
    { name: '紫菜', category: '🥫罐头/干货', unit: '包' },
    { name: '大米', category: '🍚主食/谷物', unit: '杯' },
    { name: '土豆', category: '🥬蔬菜', unit: '个' },
    { name: '鸡腿', category: '🥩肉', unit: '个' },
    { name: '盐', category: '🧂调味', unit: '勺' },
  ];
  const ingredients: Ingredient[] = defs.map((d) => ({
    id: genId(),
    name: d.name,
    category: d.category,
    defaultUnit: d.unit,
  }));
  const byName = (name: string): Ingredient =>
    ingredients.find((i) => i.name === name) as Ingredient;

  // 2) 库存（引用食材库，不含大米 → 白米饭差一点点）
  const stockDefs: Array<{
    name: string; qty: number; unit: string; location: string; expiryDays: number | null; statuses: string[];
  }> = [
    { name: '鸡蛋', qty: 6, unit: '个', location: '冷藏', expiryDays: 10, statuses: [] },
    { name: '番茄', qty: 3, unit: '个', location: '常温', expiryDays: 2, statuses: [] },
    { name: '菠菜', qty: 1, unit: '把', location: '冷藏', expiryDays: 1, statuses: ['🔒已开封'] },
    { name: '大蒜', qty: 1, unit: '头', location: '常温', expiryDays: null, statuses: [] },
    { name: '紫菜', qty: 1, unit: '包', location: '常温', expiryDays: null, statuses: ['🔒已开封'] },
    { name: '土豆', qty: 2, unit: '个', location: '常温', expiryDays: 15, statuses: [] },
    { name: '鸡腿', qty: 2, unit: '个', location: '冷冻', expiryDays: 30, statuses: ['🥩生'] },
    { name: '盐', qty: 1, unit: '瓶', location: '调料区', expiryDays: null, statuses: [] },
  ];
  const stock: StockItem[] = stockDefs.map((s) => ({
    id: genId(),
    ingredientId: byName(s.name).id,
    qty: s.qty,
    unit: s.unit,
    location: s.location,
    expiry: s.expiryDays === null ? null : dateFromNow(s.expiryDays),
    statuses: s.statuses,
    needBuy: false,
  }));

  // 3) 菜谱（引用食材库；main 默认按分类，调味/香料/佐料为辅料）
  const mk = (name: string, qty: number, unit: string) => {
    const ing = byName(name);
    return {
      ingredientId: ing.id,
      qty,
      unit,
      main: !isSeasoningCategory(ing.category),
    };
  };
  const recipes: Recipe[] = [
    {
      id: genId(), name: '番茄炒蛋', types: ['小炒'], cuisines: ['中餐'], prep: '无需提前',
      ingredients: [mk('番茄', 2, '个'), mk('鸡蛋', 3, '个'), mk('盐', 1, '勺')],
      steps: '番茄切块，鸡蛋打散。先炒蛋盛出，再炒番茄出汁，倒入鸡蛋翻炒，加盐调味。',
      isToday: false,
    },
    {
      id: genId(), name: '蒜蓉炒菠菜', types: ['小炒'], cuisines: ['中餐'], prep: '无需提前',
      ingredients: [mk('菠菜', 1, '把'), mk('大蒜', 3, '瓣'), mk('盐', 1, '勺')],
      steps: '菠菜洗净焯水，大蒜切末。热油爆香蒜末，下菠菜大火快炒，加盐出锅。',
      isToday: false,
    },
    {
      id: genId(), name: '紫菜蛋花汤', types: ['汤'], cuisines: ['中餐'], prep: '无需提前',
      ingredients: [mk('紫菜', 1, '包'), mk('鸡蛋', 1, '个'), mk('盐', 1, '勺')],
      steps: '水烧开放入紫菜，淋入打散的蛋液成蛋花，加盐和几滴香油即可。',
      isToday: false,
    },
    {
      id: genId(), name: '白米饭', types: ['主食'], cuisines: ['中餐'], prep: '无需提前',
      ingredients: [mk('大米', 1, '杯')],
      steps: '大米淘洗干净，加适量水，电饭煲蒸煮约 30 分钟。',
      isToday: false,
    },
    {
      id: genId(), name: '土豆炖鸡', types: ['炖菜'], cuisines: ['中餐'], prep: '提前半天',
      ingredients: [mk('土豆', 2, '个'), mk('鸡腿', 2, '个'), mk('盐', 1, '勺')],
      steps: '鸡腿焯水，土豆切块。热油下鸡腿翻炒，加水和土豆，炖煮 20 分钟，加盐收汁。',
      isToday: false,
    },
  ];

  return { ingredients, stock, recipes };
}
