// pages/inventory/edit/edit.ts — 新增/编辑食材
import { getInventory, saveInventory, genId } from '../../../utils/storage';
import { getLocations, addLocation } from '../../../utils/inventory';

Page({
  data: {
    id: '',                       // 空字符串 = 新增
    name: '',
    qty: 1,
    unit: '',
    locations: [] as string[],
    locationIndex: 0,
    expiry: '' as string,         // '' 表示无到期日
  },

  onLoad(options: Record<string, string>) {
    const locations = getLocations();
    const id = options.id || '';
    if (id) {
      const it = getInventory().find((x) => x.id === id);
      if (it) {
        const idx = locations.indexOf(it.location);
        // 编辑已有但位置不在列表（如历史自定义）时补进选项
        if (idx === -1) locations.push(it.location);
        this.setData({
          id,
          name: it.name,
          qty: it.qty,
          unit: it.unit,
          locations,
          locationIndex: idx >= 0 ? idx : locations.length - 1,
          expiry: it.expiry || '',
        });
        wx.setNavigationBarTitle({ title: '编辑食材' });
        return;
      }
    }
    this.setData({ locations });
    wx.setNavigationBarTitle({ title: '新增食材' });
  },

  onNameInput(e: WechatMiniprogram.Input) {
    this.setData({ name: e.detail.value });
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
        this.setData({
          locations,
          locationIndex: idx >= 0 ? idx : this.data.locationIndex,
        });
      },
    });
  },

  onExpiryChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ expiry: e.detail.value as string });
  },
  onClearExpiry() {
    this.setData({ expiry: '' });
  },

  onSave() {
    const name = this.data.name.trim();
    if (!name) {
      wx.showToast({ title: '请填写名称', icon: 'none' });
      return;
    }
    const location = this.data.locations[this.data.locationIndex] || '未分类';
    const qty = Number(this.data.qty) || 0;
    const unit = this.data.unit.trim();
    const expiry = this.data.expiry || null;

    const items = getInventory();
    if (this.data.id) {
      const idx = items.findIndex((it) => it.id === this.data.id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], name, qty, unit, location, expiry };
      }
    } else {
      items.push({ id: genId(), name, qty, unit, location, expiry, needBuy: false });
    }
    saveInventory(items);
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 400);
  },
});
