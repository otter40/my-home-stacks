// pages/inventory/inventory.ts — 库存：按位置分组（可折叠）+ 加减 + 保质期 + 需要购买
import { getInventory, saveInventory } from '../../utils/storage';
import { getLocations, getExpiryStatus, adjustQty } from '../../utils/inventory';
import { ExpiryStatus } from '../../types/index';

interface ItemVM {
  id: string;
  name: string;
  qty: number;
  unit: string;
  location: string;
  expiry?: string | null;
  needBuy: boolean;
  expiryStatus: ExpiryStatus;
  expiryLabel: string;
}

interface GroupVM {
  location: string;
  collapsed: boolean;
  items: ItemVM[];
}

const EXPIRY_LABEL: Record<ExpiryStatus, string> = {
  expired: '已过期',
  soon: '即将到期',
  ok: '',
};

Page({
  data: {
    groups: [] as GroupVM[],
    isEmpty: true,
  },

  // 折叠状态在多次刷新间保留
  collapsed: {} as Record<string, boolean>,

  onShow() {
    this.refresh();
  },

  refresh() {
    const items = getInventory();
    // 位置顺序：默认/自定义位置在前，库存中出现的其它位置（如“未分类”）追加在后
    const order = getLocations();
    for (const it of items) {
      if (!order.includes(it.location)) order.push(it.location);
    }

    const groups: GroupVM[] = [];
    for (const loc of order) {
      const groupItems = items
        .filter((it) => it.location === loc)
        .map((it): ItemVM => {
          const status = getExpiryStatus(it);
          return {
            id: it.id,
            name: it.name,
            qty: it.qty,
            unit: it.unit,
            location: it.location,
            expiry: it.expiry,
            needBuy: it.needBuy,
            expiryStatus: status,
            expiryLabel: EXPIRY_LABEL[status],
          };
        });
      if (groupItems.length > 0) {
        groups.push({
          location: loc,
          collapsed: !!this.collapsed[loc],
          items: groupItems,
        });
      }
    }

    this.setData({ groups, isEmpty: items.length === 0 });
  },

  onToggleCollapse(e: WechatMiniprogram.TouchEvent) {
    const loc = e.currentTarget.dataset.loc as string;
    this.collapsed[loc] = !this.collapsed[loc];
    this.refresh();
  },

  onInc(e: WechatMiniprogram.TouchEvent) {
    adjustQty(e.currentTarget.dataset.id as string, 1);
    this.refresh();
  },

  onDec(e: WechatMiniprogram.TouchEvent) {
    adjustQty(e.currentTarget.dataset.id as string, -1);
    this.refresh();
  },

  onToggleNeedBuy(e: WechatMiniprogram.SwitchChange) {
    const id = e.currentTarget.dataset.id as string;
    const items = getInventory();
    const idx = items.findIndex((it) => it.id === id);
    if (idx === -1) return;
    items[idx].needBuy = e.detail.value;
    saveInventory(items);
    this.refresh();
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/inventory/edit/edit' });
  },

  onEdit(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    wx.navigateTo({ url: `/pages/inventory/edit/edit?id=${id}` });
  },

  onDelete(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    const target = getInventory().find((it) => it.id === id);
    wx.showModal({
      title: '删除食材',
      content: `确定删除「${target ? target.name : ''}」吗？`,
      confirmText: '删除',
      confirmColor: '#E05C5C',
      success: (res) => {
        if (!res.confirm) return;
        saveInventory(getInventory().filter((it) => it.id !== id));
        this.refresh();
        wx.showToast({ title: '已删除', icon: 'none' });
      },
    });
  },
});
