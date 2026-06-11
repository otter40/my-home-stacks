// pages/recipes/recipes.ts — 菜谱：类型/菜系筛选 + 搜索 + 加入今天吃 + 增删
import { getRecipes, saveRecipes } from '../../utils/storage';
import { getRecipeTypes, getCuisines, mainNames, setToday } from '../../utils/recipe';

interface RecipeVM {
  id: string;
  name: string;
  types: string[];
  cuisines: string[];
  prep: string;
  mainText: string;
  isToday: boolean;
}

Page({
  data: {
    typeFilters: ['全部'] as string[],
    cuisineFilters: ['全部'] as string[],
    activeType: '全部',
    activeCuisine: '全部',
    keyword: '',
    list: [] as RecipeVM[],
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const typeFilters = ['全部', ...getRecipeTypes()];
    const cuisineFilters = ['全部', ...getCuisines()];
    const at = this.data.activeType;
    const ac = this.data.activeCuisine;
    const kw = this.data.keyword.trim().toLowerCase();

    const list: RecipeVM[] = getRecipes()
      .filter((r) => at === '全部' || r.types.indexOf(at) >= 0)
      .filter((r) => ac === '全部' || r.cuisines.indexOf(ac) >= 0)
      .filter((r) => !kw || r.name.toLowerCase().indexOf(kw) >= 0)
      .map((r) => ({
        id: r.id,
        name: r.name,
        types: r.types,
        cuisines: r.cuisines,
        prep: r.prep,
        mainText: mainNames(r).join('、') || '无主料',
        isToday: r.isToday,
      }));
    this.setData({ typeFilters, cuisineFilters, list });
  },

  onSearchInput(e: WechatMiniprogram.Input) {
    this.setData({ keyword: e.detail.value }, () => this.refresh());
  },
  onSelectType(e: WechatMiniprogram.TouchEvent) {
    this.setData({ activeType: e.currentTarget.dataset.v as string }, () => this.refresh());
  },
  onSelectCuisine(e: WechatMiniprogram.TouchEvent) {
    this.setData({ activeCuisine: e.currentTarget.dataset.v as string }, () => this.refresh());
  },

  onToggleToday(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    const r = getRecipes().find((x) => x.id === id);
    if (!r) return;
    setToday(id, !r.isToday);
    this.refresh();
    wx.showToast({ title: r.isToday ? '已移出今天吃' : '已加入今天吃', icon: 'none' });
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/recipes/edit/edit' });
  },
  onEdit(e: WechatMiniprogram.TouchEvent) {
    wx.navigateTo({ url: `/pages/recipes/edit/edit?id=${e.currentTarget.dataset.id}` });
  },
  onDelete(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    const target = getRecipes().find((r) => r.id === id);
    wx.showModal({
      title: '删除菜谱',
      content: `确定删除「${target ? target.name : ''}」吗？`,
      confirmText: '删除',
      confirmColor: '#E03E3E',
      success: (res) => {
        if (!res.confirm) return;
        saveRecipes(getRecipes().filter((r) => r.id !== id));
        this.refresh();
        wx.showToast({ title: '已删除', icon: 'none' });
      },
    });
  },
});
