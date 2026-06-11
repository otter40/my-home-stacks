// pages/ingredients/ingredients.ts — 食材库：按分类罗列 + 库存合计 + 反向关联菜谱
import { getStock } from '../../utils/storage';
import { groupByCategory, recipesUsing, stockTotalOf, removeIngredient } from '../../utils/ingredient';

interface ItemVM {
  id: string;
  name: string;
  defaultUnit: string;
  stockTotal: number;
  recipeText: string;
}
interface GroupVM {
  category: string;
  items: ItemVM[];
}

Page({
  data: {
    groups: [] as GroupVM[],
    isEmpty: true,
    expandedId: '',
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const stock = getStock();
    const groups: GroupVM[] = groupByCategory().map((g) => ({
      category: g.category,
      items: g.items.map((ing) => ({
        id: ing.id,
        name: ing.name,
        defaultUnit: ing.defaultUnit || '',
        stockTotal: stockTotalOf(ing.id, stock),
        recipeText: recipesUsing(ing.id).map((r) => r.name).join('、'),
      })),
    }));
    this.setData({ groups, isEmpty: groups.length === 0 });
  },

  onToggle(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    this.setData({ expandedId: this.data.expandedId === id ? '' : id });
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/ingredients/edit/edit' });
  },
  onEdit(e: WechatMiniprogram.TouchEvent) {
    wx.navigateTo({ url: `/pages/ingredients/edit/edit?id=${e.currentTarget.dataset.id}` });
  },
  onDelete(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    // 先探测是否被引用
    const stockUsed = getStock().some((s) => s.ingredientId === id);
    const usedByRecipes = recipesUsing(id).length;
    if (stockUsed || usedByRecipes > 0) {
      const parts: string[] = [];
      if (stockUsed) parts.push('库存');
      if (usedByRecipes > 0) parts.push(`${usedByRecipes} 个菜谱`);
      wx.showModal({
        title: '无法删除',
        content: `该食材仍被${parts.join('、')}使用，请先移除相关引用。`,
        showCancel: false,
      });
      return;
    }
    wx.showModal({
      title: '删除食材',
      content: '确定从食材库删除该食材吗？',
      confirmText: '删除',
      confirmColor: '#E03E3E',
      success: (res) => {
        if (!res.confirm) return;
        removeIngredient(id);
        this.refresh();
        wx.showToast({ title: '已删除', icon: 'none' });
      },
    });
  },
});
