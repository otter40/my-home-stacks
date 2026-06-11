// pages/fridge/fridge.ts — 冰箱能做什么：按库存计算菜谱可做状态
import { getRecipes, saveRecipes, getInventory } from '../../utils/storage';
import { calcFridgeStatus, categoryColor } from '../../utils/recipe';

interface CanMakeVM {
  id: string;
  name: string;
  category: string;
  tagColor: string;
  isToday: boolean;
  ingredientText: string;
}

interface AlmostVM {
  id: string;
  name: string;
  category: string;
  tagColor: string;
  missingText: string;
}

Page({
  data: {
    canMake: [] as CanMakeVM[],
    almost: [] as AlmostVM[],
    hasAny: false,
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const inventory = getInventory();
    const canMake: CanMakeVM[] = [];
    const almost: AlmostVM[] = [];

    for (const r of getRecipes()) {
      const res = calcFridgeStatus(r, inventory);
      if (res.status === 'ok') {
        canMake.push({
          id: r.id,
          name: r.name,
          category: r.category,
          tagColor: categoryColor(r.category),
          isToday: r.isToday,
          ingredientText: r.ingredients.map((i) => i.name).join('、') || '暂无食材',
        });
      } else if (res.status === 'almost') {
        almost.push({
          id: r.id,
          name: r.name,
          category: r.category,
          tagColor: categoryColor(r.category),
          missingText: res.missing.join('、'),
        });
      }
      // status === 'no'（缺 3 项及以上）不展示
    }

    this.setData({
      canMake,
      almost,
      hasAny: canMake.length > 0 || almost.length > 0,
    });
  },

  onAddToday(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    const recipes = getRecipes();
    const idx = recipes.findIndex((r) => r.id === id);
    if (idx === -1) return;
    if (recipes[idx].isToday) return;
    recipes[idx].isToday = true;
    saveRecipes(recipes);
    this.refresh();
    wx.showToast({ title: '已加入今天吃', icon: 'none' });
  },
});
