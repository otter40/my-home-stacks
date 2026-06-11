// utils/seed.ts — 首次启动写入的示例数据
// 参考 docs/spec.md §5。导出为函数，确保每次生成的 id 唯一、保质期相对“今天”计算。

import { Recipe, InventoryItem } from '../types/index';
import { genId } from './storage';

/** 返回从今天起偏移 days 天的 ISO 日期字符串（YYYY-MM-DD） */
function dateFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 示例菜谱（5 条，覆盖荤菜/素菜/汤羹/主食） */
export function seedRecipes(): Recipe[] {
  return [
    {
      id: genId(),
      name: '番茄炒蛋',
      category: '荤菜',
      ingredients: [
        { name: '番茄', qty: 2, unit: '个' },
        { name: '鸡蛋', qty: 3, unit: '个' },
      ],
      steps: '番茄切块，鸡蛋打散。先炒蛋盛出，再炒番茄出汁，倒入鸡蛋翻炒，加盐调味。',
      isToday: false,
    },
    {
      id: genId(),
      name: '蒜蓉炒菠菜',
      category: '素菜',
      ingredients: [
        { name: '菠菜', qty: 1, unit: '把' },
        { name: '大蒜', qty: 3, unit: '瓣' },
      ],
      steps: '菠菜洗净焯水，大蒜切末。热油爆香蒜末，下菠菜大火快炒，加盐出锅。',
      isToday: false,
    },
    {
      id: genId(),
      name: '紫菜蛋花汤',
      category: '汤羹',
      ingredients: [
        { name: '紫菜', qty: 1, unit: '包' },
        { name: '鸡蛋', qty: 1, unit: '个' },
      ],
      steps: '水烧开放入紫菜，淋入打散的蛋液成蛋花，加盐和几滴香油即可。',
      isToday: false,
    },
    {
      id: genId(),
      name: '白米饭',
      category: '主食',
      ingredients: [
        { name: '大米', qty: 1, unit: '杯' },
      ],
      steps: '大米淘洗干净，加适量水，电饭煲蒸煮约 30 分钟。',
      isToday: false,
    },
    {
      id: genId(),
      name: '土豆炖鸡',
      category: '荤菜',
      ingredients: [
        { name: '土豆', qty: 2, unit: '个' },
        { name: '鸡腿', qty: 2, unit: '个' },
        { name: '盐', qty: 1, unit: '勺' },
      ],
      steps: '鸡腿焯水，土豆切块。热油下鸡腿翻炒，加水和土豆，炖煮 20 分钟，加盐收汁。',
      isToday: false,
    },
  ];
}

/** 示例库存（8 条，覆盖冷藏/冷冻/常温/调料区） */
export function seedInventory(): InventoryItem[] {
  return [
    { id: genId(), name: '鸡蛋', qty: 6, unit: '个', location: '冷藏', expiry: dateFromNow(10), needBuy: false },
    { id: genId(), name: '番茄', qty: 3, unit: '个', location: '常温', expiry: dateFromNow(2), needBuy: false },
    { id: genId(), name: '菠菜', qty: 1, unit: '把', location: '冷藏', expiry: dateFromNow(1), needBuy: false },
    { id: genId(), name: '大蒜', qty: 1, unit: '头', location: '常温', expiry: null, needBuy: false },
    { id: genId(), name: '紫菜', qty: 1, unit: '包', location: '常温', expiry: null, needBuy: false },
    { id: genId(), name: '土豆', qty: 2, unit: '个', location: '常温', expiry: dateFromNow(15), needBuy: false },
    { id: genId(), name: '鸡腿', qty: 2, unit: '个', location: '冷冻', expiry: dateFromNow(30), needBuy: false },
    { id: genId(), name: '盐', qty: 1, unit: '瓶', location: '调料区', expiry: null, needBuy: false },
  ];
}
