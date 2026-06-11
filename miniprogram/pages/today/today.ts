// pages/today/today.ts — 今天吃：展示 isToday 菜谱，支持「做完了」
import { getRecipes, saveRecipes } from '../../utils/storage';
import { categoryColor } from '../../utils/recipe';

interface TodayVM {
  id: string;
  name: string;
  category: string;
  tagColor: string;
  ingredientText: string;
}

Page({
  data: {
    list: [] as TodayVM[],
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const list: TodayVM[] = getRecipes()
      .filter((r) => r.isToday)
      .map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        tagColor: categoryColor(r.category),
        ingredientText:
          r.ingredients
            .map((i) => `${i.name} ${i.qty}${i.unit}`)
            .join('、') || '暂无食材',
      }));
    this.setData({ list });
  },

  onDone(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    const recipes = getRecipes();
    const idx = recipes.findIndex((r) => r.id === id);
    if (idx === -1) return;
    recipes[idx].isToday = false;
    saveRecipes(recipes);
    this.refresh();
    wx.showToast({ title: '完成啦 🎉', icon: 'none' });
  },

  goFridge() {
    wx.switchTab({ url: '/pages/fridge/fridge' });
  },
  goRecipes() {
    wx.switchTab({ url: '/pages/recipes/recipes' });
  },
});
