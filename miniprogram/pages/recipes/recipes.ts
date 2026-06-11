// pages/recipes/recipes.ts — 菜谱库：列表 + 分类筛选 + 搜索 + 删除
import { getRecipes, saveRecipes } from '../../utils/storage';
import { getCategories, categoryColor } from '../../utils/recipe';

interface RecipeVM {
  id: string;
  name: string;
  category: string;
  isToday: boolean;
  tagColor: string;
  ingredientText: string;
}

Page({
  data: {
    categories: ['全部'] as string[],
    activeCategory: '全部',
    keyword: '',
    list: [] as RecipeVM[],
  },

  onShow() {
    this.refresh();
  },

  /** 重新读取并按当前筛选/搜索条件构建列表 */
  refresh() {
    const categories = ['全部', ...getCategories()];
    const active = this.data.activeCategory;
    const kw = this.data.keyword.trim().toLowerCase();
    const list: RecipeVM[] = getRecipes()
      .filter((r) => active === '全部' || r.category === active)
      .filter((r) => !kw || r.name.toLowerCase().includes(kw))
      .map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        isToday: r.isToday,
        tagColor: categoryColor(r.category),
        ingredientText:
          r.ingredients.map((i) => i.name).join('、') || '暂无食材',
      }));
    this.setData({ categories, list });
  },

  onSearchInput(e: WechatMiniprogram.Input) {
    this.setData({ keyword: e.detail.value }, () => this.refresh());
  },

  onSelectCategory(e: WechatMiniprogram.TouchEvent) {
    const cat = e.currentTarget.dataset.cat as string;
    this.setData({ activeCategory: cat }, () => this.refresh());
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/recipes/edit/edit' });
  },

  onEdit(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    wx.navigateTo({ url: `/pages/recipes/edit/edit?id=${id}` });
  },

  onDelete(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    const target = getRecipes().find((r) => r.id === id);
    wx.showModal({
      title: '删除菜谱',
      content: `确定删除「${target ? target.name : ''}」吗？`,
      confirmText: '删除',
      confirmColor: '#E05C5C',
      success: (res) => {
        if (!res.confirm) return;
        saveRecipes(getRecipes().filter((r) => r.id !== id));
        this.refresh();
        wx.showToast({ title: '已删除', icon: 'none' });
      },
    });
  },
});
