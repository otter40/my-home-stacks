// pages/recipes/edit/edit.ts — 新增/编辑菜谱
import { Ingredient } from '../../../types/index';
import { getRecipes, saveRecipes, genId } from '../../../utils/storage';
import { getCategories, addCategory } from '../../../utils/recipe';

Page({
  data: {
    id: '',                         // 空字符串 = 新增
    name: '',
    categories: [] as string[],
    categoryIndex: 0,
    ingredients: [{ name: '', qty: 1, unit: '' }] as Ingredient[],
    steps: '',
  },

  onLoad(options: Record<string, string>) {
    const categories = getCategories();
    const id = options.id || '';
    if (id) {
      const r = getRecipes().find((x) => x.id === id);
      if (r) {
        const idx = categories.indexOf(r.category);
        this.setData({
          id,
          name: r.name,
          categories,
          categoryIndex: idx >= 0 ? idx : 0,
          ingredients: r.ingredients.length
            ? r.ingredients.map((i) => ({ ...i }))
            : [{ name: '', qty: 1, unit: '' }],
          steps: r.steps || '',
        });
        wx.setNavigationBarTitle({ title: '编辑菜谱' });
        return;
      }
    }
    this.setData({ categories });
    wx.setNavigationBarTitle({ title: '新增菜谱' });
  },

  onNameInput(e: WechatMiniprogram.Input) {
    this.setData({ name: e.detail.value });
  },

  onCategoryChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ categoryIndex: Number(e.detail.value) });
  },

  onAddCategory() {
    wx.showModal({
      title: '新增分类',
      editable: true,
      placeholderText: '请输入分类名称',
      success: (res) => {
        if (!res.confirm) return;
        const value = (res.content || '').trim();
        if (!value) return;
        const categories = addCategory(value);
        const idx = categories.indexOf(value);
        this.setData({
          categories,
          categoryIndex: idx >= 0 ? idx : this.data.categoryIndex,
        });
      },
    });
  },

  // ---- 食材动态行 ----
  onIngNameInput(e: WechatMiniprogram.Input) {
    const i = e.currentTarget.dataset.index as number;
    this.setData({ [`ingredients[${i}].name`]: e.detail.value });
  },
  onIngQtyInput(e: WechatMiniprogram.Input) {
    const i = e.currentTarget.dataset.index as number;
    const v = Number(e.detail.value);
    this.setData({ [`ingredients[${i}].qty`]: isNaN(v) ? 0 : v });
  },
  onIngUnitInput(e: WechatMiniprogram.Input) {
    const i = e.currentTarget.dataset.index as number;
    this.setData({ [`ingredients[${i}].unit`]: e.detail.value });
  },
  onAddIng() {
    const ingredients = this.data.ingredients.concat({ name: '', qty: 1, unit: '' });
    this.setData({ ingredients });
  },
  onRemoveIng(e: WechatMiniprogram.TouchEvent) {
    const i = e.currentTarget.dataset.index as number;
    const ingredients = this.data.ingredients.slice();
    ingredients.splice(i, 1);
    this.setData({ ingredients });
  },

  onStepsInput(e: WechatMiniprogram.Input) {
    this.setData({ steps: e.detail.value });
  },

  onSave() {
    const name = this.data.name.trim();
    if (!name) {
      wx.showToast({ title: '请填写菜名', icon: 'none' });
      return;
    }
    const category = this.data.categories[this.data.categoryIndex] || '其他';
    const ingredients: Ingredient[] = this.data.ingredients
      .filter((i) => i.name.trim())
      .map((i) => ({
        name: i.name.trim(),
        qty: Number(i.qty) || 0,
        unit: (i.unit || '').trim(),
      }));
    const steps = this.data.steps.trim();

    const recipes = getRecipes();
    if (this.data.id) {
      const idx = recipes.findIndex((r) => r.id === this.data.id);
      if (idx !== -1) {
        recipes[idx] = { ...recipes[idx], name, category, ingredients, steps };
      }
    } else {
      recipes.push({ id: genId(), name, category, ingredients, steps, isToday: false });
    }
    saveRecipes(recipes);
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 400);
  },
});
