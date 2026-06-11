// pages/shopping/shopping.ts — 购物袋：自动汇总（只读）+ 手动添加 + 已购买
import {
  getRecipes,
  getInventory,
  getShoppingItems,
  saveShoppingItems,
  genId,
} from '../../utils/storage';
import { getAutoItems, markAsPurchased, AutoSource } from '../../utils/shopping';
import { ShoppingItem } from '../../types/index';

interface AutoVM {
  name: string;
  qty?: number;
  unit?: string;
  sourceText: string;
}

function sourceText(sources: AutoSource[]): string {
  const fromRecipe = sources.includes('recipe');
  const fromNeedBuy = sources.includes('needBuy');
  if (fromRecipe && fromNeedBuy) return '今天吃缺料 · 库存待购';
  if (fromRecipe) return '今天吃缺料';
  return '库存待购';
}

Page({
  data: {
    autoItems: [] as AutoVM[],
    manualItems: [] as ShoppingItem[],
    form: { name: '', qty: '', unit: '' },
    hasAny: false,
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const autoItems: AutoVM[] = getAutoItems(getRecipes(), getInventory()).map((a) => ({
      name: a.name,
      qty: a.qty,
      unit: a.unit,
      sourceText: sourceText(a.sources),
    }));
    const manualItems = getShoppingItems();
    this.setData({
      autoItems,
      manualItems,
      hasAny: autoItems.length > 0 || manualItems.length > 0,
    });
  },

  // ---- 手动添加表单 ----
  onFormName(e: WechatMiniprogram.Input) {
    this.setData({ 'form.name': e.detail.value });
  },
  onFormQty(e: WechatMiniprogram.Input) {
    this.setData({ 'form.qty': e.detail.value });
  },
  onFormUnit(e: WechatMiniprogram.Input) {
    this.setData({ 'form.unit': e.detail.value });
  },
  onAddManual() {
    const name = this.data.form.name.trim();
    if (!name) {
      wx.showToast({ title: '请填写名称', icon: 'none' });
      return;
    }
    const qtyNum = Number(this.data.form.qty);
    const item: ShoppingItem = {
      id: genId(),
      name,
      qty: this.data.form.qty && !isNaN(qtyNum) ? qtyNum : undefined,
      unit: this.data.form.unit.trim() || undefined,
    };
    const items = getShoppingItems();
    items.push(item);
    saveShoppingItems(items);
    this.setData({ form: { name: '', qty: '', unit: '' } });
    this.refresh();
  },

  // ---- 已购买 ----
  onPurchaseAuto(e: WechatMiniprogram.TouchEvent) {
    const i = e.currentTarget.dataset.index as number;
    const item = this.data.autoItems[i];
    if (!item) return;
    markAsPurchased({ name: item.name, qty: item.qty, unit: item.unit });
    this.refresh();
    wx.showToast({ title: '已购买，存入库存', icon: 'none' });
  },

  onPurchaseManual(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    const item = getShoppingItems().find((x) => x.id === id);
    if (!item) return;
    markAsPurchased({ name: item.name, qty: item.qty, unit: item.unit });
    saveShoppingItems(getShoppingItems().filter((x) => x.id !== id));
    this.refresh();
    wx.showToast({ title: '已购买，存入库存', icon: 'none' });
  },

  onDeleteManual(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    const item = getShoppingItems().find((x) => x.id === id);
    wx.showModal({
      title: '删除',
      content: `从购物袋移除「${item ? item.name : ''}」吗？`,
      confirmText: '删除',
      confirmColor: '#E05C5C',
      success: (res) => {
        if (!res.confirm) return;
        saveShoppingItems(getShoppingItems().filter((x) => x.id !== id));
        this.refresh();
      },
    });
  },
});
