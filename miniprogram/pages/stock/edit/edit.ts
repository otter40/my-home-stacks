// pages/stock/edit/edit.ts — 新增/编辑库存
import { Ingredient, StockItem } from '../../../types/index';
import { getStock, saveStock, genId } from '../../../utils/storage';
import { getLocations, addLocation, getStatuses } from '../../../utils/stock';
import { getIngredients, findOrCreateByName } from '../../../utils/ingredient';

Page({
  data: {
    id: '',
    ingredients: [] as Ingredient[],
    ingredientNames: [] as string[],
    ingredientIndex: -1,
    qty: 1,
    unit: '',
    locations: [] as string[],
    locationIndex: 0,
    expiry: '',
    statusOptions: [] as Array<{ name: string; on: boolean }>,
    selectedStatuses: [] as string[],
  },

  /** 根据已选状态重建多选 chip 的 on 标记 */
  buildStatusOptions(selected: string[]) {
    this.setData({
      statusOptions: getStatuses().map((name) => ({ name, on: selected.indexOf(name) >= 0 })),
      selectedStatuses: selected,
    });
  },

  onLoad(options: Record<string, string>) {
    this.loadIngredients();
    const locations = getLocations();
    const id = options.id || '';

    if (id) {
      const it = getStock().find((s) => s.id === id);
      if (it) {
        let locIdx = locations.indexOf(it.location);
        if (locIdx === -1) {
          locations.push(it.location);
          locIdx = locations.length - 1;
        }
        const ingIdx = this.data.ingredients.findIndex((i) => i.id === it.ingredientId);
        this.setData({
          id,
          ingredientIndex: ingIdx,
          qty: it.qty,
          unit: it.unit,
          locations,
          locationIndex: locIdx,
          expiry: it.expiry || '',
        });
        this.buildStatusOptions(it.statuses.slice());
        wx.setNavigationBarTitle({ title: '编辑库存' });
        return;
      }
    }
    this.setData({ locations });
    this.buildStatusOptions([]);
    wx.setNavigationBarTitle({ title: '新增库存' });
  },

  loadIngredients() {
    const ingredients = getIngredients();
    this.setData({
      ingredients,
      ingredientNames: ingredients.map((i) => `${i.category} ${i.name}`),
    });
  },

  onPickIngredient(e: WechatMiniprogram.PickerChange) {
    const idx = Number(e.detail.value);
    const ing = this.data.ingredients[idx];
    const patch: Record<string, unknown> = { ingredientIndex: idx };
    if (!this.data.unit && ing && ing.defaultUnit) patch.unit = ing.defaultUnit;
    this.setData(patch);
  },

  onNewIngredient() {
    wx.showModal({
      title: '新建食材',
      editable: true,
      placeholderText: '请输入食材名称',
      success: (res) => {
        if (!res.confirm) return;
        const value = (res.content || '').trim();
        if (!value) return;
        const ing = findOrCreateByName(value);
        this.loadIngredients();
        const idx = this.data.ingredients.findIndex((i) => i.id === ing.id);
        const patch: Record<string, unknown> = { ingredientIndex: idx };
        if (!this.data.unit && ing.defaultUnit) patch.unit = ing.defaultUnit;
        this.setData(patch);
        wx.showToast({ title: '已加入食材库', icon: 'none' });
      },
    });
  },

  onQtyInput(e: WechatMiniprogram.Input) {
    const v = Number(e.detail.value);
    this.setData({ qty: isNaN(v) ? 0 : v });
  },
  onUnitInput(e: WechatMiniprogram.Input) {
    this.setData({ unit: e.detail.value });
  },

  onLocationChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ locationIndex: Number(e.detail.value) });
  },
  onAddLocation() {
    wx.showModal({
      title: '新增位置',
      editable: true,
      placeholderText: '请输入存放位置',
      success: (res) => {
        if (!res.confirm) return;
        const value = (res.content || '').trim();
        if (!value) return;
        const locations = addLocation(value);
        const idx = locations.indexOf(value);
        this.setData({ locations, locationIndex: idx >= 0 ? idx : this.data.locationIndex });
      },
    });
  },

  onExpiryChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ expiry: e.detail.value as string });
  },
  onExpiryInput(e: WechatMiniprogram.Input) {
    this.setData({ expiry: e.detail.value.trim() });
  },
  onClearExpiry() {
    this.setData({ expiry: '' });
  },

  onToggleStatus(e: WechatMiniprogram.TouchEvent) {
    const s = e.currentTarget.dataset.status as string;
    const selected = this.data.selectedStatuses.slice();
    const i = selected.indexOf(s);
    if (i === -1) selected.push(s);
    else selected.splice(i, 1);
    this.buildStatusOptions(selected);
  },

  onSave() {
    const ing = this.data.ingredients[this.data.ingredientIndex];
    if (!ing) {
      wx.showToast({ title: '请选择食材', icon: 'none' });
      return;
    }
    const location = this.data.locations[this.data.locationIndex] || '未分类';
    const qty = Number(this.data.qty) || 0;
    const unit = this.data.unit.trim() || ing.defaultUnit || '';
    const expiry = this.data.expiry || null;

    const items = getStock();
    if (this.data.id) {
      const idx = items.findIndex((s) => s.id === this.data.id);
      if (idx !== -1) {
        items[idx] = {
          ...items[idx],
          ingredientId: ing.id,
          qty,
          unit,
          location,
          expiry,
          statuses: this.data.selectedStatuses.slice(),
        };
      }
    } else {
      const item: StockItem = {
        id: genId(),
        ingredientId: ing.id,
        qty,
        unit,
        location,
        expiry,
        statuses: this.data.selectedStatuses.slice(),
        needBuy: false,
      };
      items.push(item);
    }
    saveStock(items);
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 400);
  },
});
