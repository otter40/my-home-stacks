// pages/recipes/edit/edit.ts — 新增/编辑菜谱
import { Ingredient, RecipeIngredient } from '../../../types/index';
import { getRecipes, saveRecipes, genId } from '../../../utils/storage';
import {
  getRecipeTypes,
  getCuisines,
  getPrepOptions,
  addRecipeType,
  addCuisine,
  defaultMain,
} from '../../../utils/recipe';
import { getIngredients, findOrCreateByName } from '../../../utils/ingredient';

interface Row {
  ingredientIndex: number; // -1 = 未选
  qty: number;
  unit: string;
  main: boolean;
}

Page({
  data: {
    id: '',
    name: '',
    typeOptions: [] as Array<{ name: string; on: boolean }>,
    cuisineOptions: [] as Array<{ name: string; on: boolean }>,
    prepOptions: [] as string[],
    prepIndex: 0,
    ingredients: [] as Ingredient[],
    ingredientNames: [] as string[],
    rows: [] as Row[],
    steps: '',
  },

  onLoad(options: Record<string, string>) {
    this.loadIngredients();
    const prepOptions = getPrepOptions();
    const id = options.id || '';

    if (id) {
      const r = getRecipes().find((x) => x.id === id);
      if (r) {
        const rows: Row[] = r.ingredients.map((ing) => ({
          ingredientIndex: this.data.ingredients.findIndex((i) => i.id === ing.ingredientId),
          qty: ing.qty,
          unit: ing.unit,
          main: ing.main,
        }));
        this.setData({
          id,
          name: r.name,
          typeOptions: getRecipeTypes().map((n) => ({ name: n, on: r.types.indexOf(n) >= 0 })),
          cuisineOptions: getCuisines().map((n) => ({ name: n, on: r.cuisines.indexOf(n) >= 0 })),
          prepOptions,
          prepIndex: Math.max(0, prepOptions.indexOf(r.prep)),
          rows: rows.length ? rows : [{ ingredientIndex: -1, qty: 1, unit: '', main: true }],
          steps: r.steps || '',
        });
        wx.setNavigationBarTitle({ title: '编辑菜谱' });
        return;
      }
    }
    this.setData({
      typeOptions: getRecipeTypes().map((n) => ({ name: n, on: false })),
      cuisineOptions: getCuisines().map((n) => ({ name: n, on: false })),
      prepOptions,
      rows: [{ ingredientIndex: -1, qty: 1, unit: '', main: true }],
    });
    wx.setNavigationBarTitle({ title: '新增菜谱' });
  },

  loadIngredients() {
    const ingredients = getIngredients();
    this.setData({
      ingredients,
      ingredientNames: ingredients.map((i) => `${i.category} ${i.name}`),
    });
  },

  onNameInput(e: WechatMiniprogram.Input) {
    this.setData({ name: e.detail.value });
  },

  // ---- 类型多选 ----
  onToggleType(e: WechatMiniprogram.TouchEvent) {
    const name = e.currentTarget.dataset.name as string;
    const opts = this.data.typeOptions.map((o) => (o.name === name ? { ...o, on: !o.on } : o));
    this.setData({ typeOptions: opts });
  },
  onAddType() {
    wx.showModal({
      title: '新增类型', editable: true, placeholderText: '请输入类型',
      success: (res) => {
        if (!res.confirm) return;
        const v = (res.content || '').trim();
        if (!v) return;
        addRecipeType(v);
        const existing = new Set(this.data.typeOptions.filter((o) => o.on).map((o) => o.name));
        existing.add(v);
        this.setData({
          typeOptions: getRecipeTypes().map((n) => ({ name: n, on: existing.has(n) })),
        });
      },
    });
  },

  // ---- 菜系多选 ----
  onToggleCuisine(e: WechatMiniprogram.TouchEvent) {
    const name = e.currentTarget.dataset.name as string;
    const opts = this.data.cuisineOptions.map((o) => (o.name === name ? { ...o, on: !o.on } : o));
    this.setData({ cuisineOptions: opts });
  },
  onAddCuisine() {
    wx.showModal({
      title: '新增菜系', editable: true, placeholderText: '请输入菜系',
      success: (res) => {
        if (!res.confirm) return;
        const v = (res.content || '').trim();
        if (!v) return;
        addCuisine(v);
        const existing = new Set(this.data.cuisineOptions.filter((o) => o.on).map((o) => o.name));
        existing.add(v);
        this.setData({
          cuisineOptions: getCuisines().map((n) => ({ name: n, on: existing.has(n) })),
        });
      },
    });
  },

  onPrepChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ prepIndex: Number(e.detail.value) });
  },

  // ---- 食材行 ----
  onPickRowIngredient(e: WechatMiniprogram.PickerChange) {
    const i = e.currentTarget.dataset.index as number;
    const idx = Number(e.detail.value);
    const ing = this.data.ingredients[idx];
    const rows = this.data.rows.slice();
    rows[i] = {
      ...rows[i],
      ingredientIndex: idx,
      unit: rows[i].unit || (ing && ing.defaultUnit) || '',
      main: ing ? defaultMain(ing.category) : rows[i].main,
    };
    this.setData({ rows });
  },
  onRowQty(e: WechatMiniprogram.Input) {
    const i = e.currentTarget.dataset.index as number;
    const v = Number(e.detail.value);
    this.setData({ [`rows[${i}].qty`]: isNaN(v) ? 0 : v });
  },
  onRowUnit(e: WechatMiniprogram.Input) {
    const i = e.currentTarget.dataset.index as number;
    this.setData({ [`rows[${i}].unit`]: e.detail.value });
  },
  onToggleRowMain(e: WechatMiniprogram.TouchEvent) {
    const i = e.currentTarget.dataset.index as number;
    this.setData({ [`rows[${i}].main`]: !this.data.rows[i].main });
  },
  onAddRow() {
    this.setData({ rows: this.data.rows.concat({ ingredientIndex: -1, qty: 1, unit: '', main: true }) });
  },
  onRemoveRow(e: WechatMiniprogram.TouchEvent) {
    const i = e.currentTarget.dataset.index as number;
    const rows = this.data.rows.slice();
    rows.splice(i, 1);
    this.setData({ rows });
  },
  onNewIngredient() {
    wx.showModal({
      title: '新建食材', editable: true, placeholderText: '请输入食材名称',
      success: (res) => {
        if (!res.confirm) return;
        const v = (res.content || '').trim();
        if (!v) return;
        findOrCreateByName(v);
        this.loadIngredients();
        wx.showToast({ title: '已加入食材库', icon: 'none' });
      },
    });
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
    const ingredients: RecipeIngredient[] = this.data.rows
      .filter((row) => row.ingredientIndex >= 0)
      .map((row) => {
        const ing = this.data.ingredients[row.ingredientIndex];
        return {
          ingredientId: ing.id,
          qty: Number(row.qty) || 0,
          unit: (row.unit || '').trim() || ing.defaultUnit || '',
          main: row.main,
        };
      });
    const types = this.data.typeOptions.filter((o) => o.on).map((o) => o.name);
    const cuisines = this.data.cuisineOptions.filter((o) => o.on).map((o) => o.name);
    const prep = this.data.prepOptions[this.data.prepIndex] || '无需提前';
    const steps = this.data.steps.trim();

    const recipes = getRecipes();
    if (this.data.id) {
      const idx = recipes.findIndex((r) => r.id === this.data.id);
      if (idx !== -1) {
        recipes[idx] = { ...recipes[idx], name, types, cuisines, prep, ingredients, steps };
      }
    } else {
      recipes.push({ id: genId(), name, types, cuisines, prep, ingredients, steps, isToday: false });
    }
    saveRecipes(recipes);
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 400);
  },
});
