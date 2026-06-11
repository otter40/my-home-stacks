// constants/options.ts — 各分类/标签默认选项（参考 docs/spec.md §5）

/** 菜谱·类型（多选） */
export const RECIPE_TYPES = [
  '小炒', '炖菜', '蒸菜', '凉拌', '汤', '面点', '半成品', '主食', '甜品', '饮品', '零食',
];

/** 菜谱·菜系（多选） */
export const CUISINES = [
  '中餐', '日餐', '韩餐', '西餐', '东南亚', '印度菜', '中东/地中海', '其他/融合',
];

/** 菜谱·提前备菜（单选） */
export const PREP_OPTIONS = [
  '无需提前', '提前半天', '提前1天', '提前2天', '提前3天及以上', '现做现吃',
];

/** 食材库·食材分类（单选，带 emoji） */
export const INGREDIENT_CATEGORIES = [
  '🥩肉', '🥬蔬菜', '🐟海鲜', '🥚蛋奶', '🫘豆制品', '🍚主食/谷物', '🍄菌菇',
  '🧂调味', '🌿香料', '🧄佐料', '🥫罐头/干货', '🥤饮品', '🍎水果', '🥜坚果/种子',
  '🧊冷冻/速冻', '🍰烘焙/甜品原料', '🥗加工食品/半成品', '🍵茶/冲泡饮品', '🍿零食',
];

/** 库存·状态（多选，带 emoji） */
export const STOCK_STATUSES = [
  '🔒已开封', '⏰快过期', '🥩生', '📦分装', '🧂已腌制', '💧已焯水', '🫧已泡水',
];

/** 库存·存放位置（单选，可自定义） */
export const DEFAULT_LOCATIONS = ['冷藏', '冷冻', '常温', '调料区'];

/** 已购买/未指定位置时的兜底位置 */
export const UNCLASSIFIED_LOCATION = '未分类';

/** 食材未指定分类时的兜底分类 */
export const UNCLASSIFIED_CATEGORY = '🍴未分类';

/** 判断某食材分类是否属于调味/香料/佐料（决定菜谱食材的 main 默认值） */
export function isSeasoningCategory(category: string): boolean {
  return ['调味', '香料', '佐料'].some((k) => category.includes(k));
}
