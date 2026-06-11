// pages/ingredients/edit/edit.ts — 新增/编辑食材
import { genId } from '../../../utils/storage';
import {
  getIngredient,
  upsertIngredient,
  getIngredientCategories,
  addIngredientCategory,
} from '../../../utils/ingredient';

Page({
  data: {
    id: '',
    name: '',
    categories: [] as string[],
    categoryIndex: 0,
    defaultUnit: '',
  },

  onLoad(options: Record<string, string>) {
    const categories = getIngredientCategories();
    const id = options.id || '';
    if (id) {
      const ing = getIngredient(id);
      if (ing) {
        let idx = categories.indexOf(ing.category);
        if (idx === -1) {
          categories.push(ing.category);
          idx = categories.length - 1;
        }
        this.setData({
          id,
          name: ing.name,
          categories,
          categoryIndex: idx,
          defaultUnit: ing.defaultUnit || '',
        });
        wx.setNavigationBarTitle({ title: '编辑食材' });
        return;
      }
    }
    this.setData({ categories });
    wx.setNavigationBarTitle({ title: '新增食材' });
  },

  onNameInput(e: WechatMiniprogram.Input) {
    this.setData({ name: e.detail.value });
  },
  onUnitInput(e: WechatMiniprogram.Input) {
    this.setData({ defaultUnit: e.detail.value });
  },
  onCategoryChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ categoryIndex: Number(e.detail.value) });
  },
  onAddCategory() {
    wx.showModal({
      title: '新增食材分类',
      editable: true,
      placeholderText: '请输入分类名称',
      success: (res) => {
        if (!res.confirm) return;
        const value = (res.content || '').trim();
        if (!value) return;
        const categories = addIngredientCategory(value);
        const idx = categories.indexOf(value);
        this.setData({ categories, categoryIndex: idx >= 0 ? idx : this.data.categoryIndex });
      },
    });
  },

  onSave() {
    const name = this.data.name.trim();
    if (!name) {
      wx.showToast({ title: '请填写名称', icon: 'none' });
      return;
    }
    const category = this.data.categories[this.data.categoryIndex] || '🍴未分类';
    const defaultUnit = this.data.defaultUnit.trim();
    upsertIngredient({
      id: this.data.id || genId(),
      name,
      category,
      defaultUnit: defaultUnit || undefined,
    });
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 400);
  },
});
