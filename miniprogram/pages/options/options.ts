// pages/options/options.ts — 分类/标签管理（自定义选项增删）
import { CustomOptions } from '../../types/index';
import { getCustomOptions, saveCustomOptions } from '../../utils/storage';
import {
  RECIPE_TYPES,
  CUISINES,
  INGREDIENT_CATEGORIES,
  STOCK_STATUSES,
  DEFAULT_LOCATIONS,
} from '../../constants/options';

type OptKey = keyof CustomOptions;

interface GroupVM {
  key: OptKey;
  title: string;
  items: Array<{ name: string; custom: boolean }>;
}

const DEFAULTS: Record<OptKey, string[]> = {
  recipeTypes: RECIPE_TYPES,
  cuisines: CUISINES,
  ingredientCategories: INGREDIENT_CATEGORIES,
  locations: DEFAULT_LOCATIONS,
  stockStatuses: STOCK_STATUSES,
};
const TITLES: Record<OptKey, string> = {
  recipeTypes: '菜谱类型',
  cuisines: '菜系',
  ingredientCategories: '食材分类',
  locations: '存放位置',
  stockStatuses: '库存状态',
};

Page({
  data: {
    groups: [] as GroupVM[],
  },

  onLoad() {
    this.refresh();
  },

  refresh() {
    const custom = getCustomOptions();
    const keys: OptKey[] = ['recipeTypes', 'cuisines', 'ingredientCategories', 'locations', 'stockStatuses'];
    const groups: GroupVM[] = keys.map((key) => ({
      key,
      title: TITLES[key],
      items: [
        ...DEFAULTS[key].map((name) => ({ name, custom: false })),
        ...custom[key].map((name) => ({ name, custom: true })),
      ],
    }));
    this.setData({ groups });
  },

  onAdd(e: WechatMiniprogram.TouchEvent) {
    const key = e.currentTarget.dataset.key as OptKey;
    wx.showModal({
      title: `新增${TITLES[key]}`,
      editable: true,
      placeholderText: '请输入名称',
      success: (res) => {
        if (!res.confirm) return;
        const value = (res.content || '').trim();
        if (!value) return;
        if (DEFAULTS[key].indexOf(value) >= 0) {
          wx.showToast({ title: '已是默认选项', icon: 'none' });
          return;
        }
        const custom = getCustomOptions();
        if (custom[key].indexOf(value) >= 0) {
          wx.showToast({ title: '已存在', icon: 'none' });
          return;
        }
        custom[key].push(value);
        saveCustomOptions(custom);
        this.refresh();
      },
    });
  },

  onRemove(e: WechatMiniprogram.TouchEvent) {
    const key = e.currentTarget.dataset.key as OptKey;
    const name = e.currentTarget.dataset.name as string;
    wx.showModal({
      title: '删除选项',
      content: `删除自定义「${name}」？已使用它的记录不受影响。`,
      confirmText: '删除',
      confirmColor: '#E03E3E',
      success: (res) => {
        if (!res.confirm) return;
        const custom = getCustomOptions();
        custom[key] = custom[key].filter((n) => n !== name);
        saveCustomOptions(custom);
        this.refresh();
      },
    });
  },
});
