// pages/stock/stock.ts — 库存：按位置分组 + 状态标签 + 加减 + 按钮式需购买
import { getStock, saveStock } from '../../utils/storage';
import { getLocations, getExpiryStatus, adjustQty, toggleNeedBuy } from '../../utils/stock';
import { ingredientName } from '../../utils/ingredient';
import { ExpiryStatus } from '../../types/index';

interface ItemVM {
  id: string;
  name: string;
  qty: number;
  unit: string;
  statuses: string[];
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

  collapsed: {} as Record<string, boolean>,

  onShow() {
    this.refresh();
  },

  refresh() {
    const items = getStock();
    const order = getLocations();
    for (const it of items) if (!order.includes(it.location)) order.push(it.location);

    const groups: GroupVM[] = [];
    for (const loc of order) {
      const groupItems = items
        .filter((it) => it.location === loc)
        .map((it): ItemVM => {
          const status = getExpiryStatus(it);
          return {
            id: it.id,
            name: ingredientName(it.ingredientId),
            qty: it.qty,
            unit: it.unit,
            statuses: it.statuses,
            needBuy: it.needBuy,
            expiryStatus: status,
            expiryLabel: EXPIRY_LABEL[status],
          };
        });
      if (groupItems.length > 0) {
        groups.push({ location: loc, collapsed: !!this.collapsed[loc], items: groupItems });
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

  onToggleNeedBuy(e: WechatMiniprogram.TouchEvent) {
    toggleNeedBuy(e.currentTarget.dataset.id as string);
    this.refresh();
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/stock/edit/edit' });
  },
  onEdit(e: WechatMiniprogram.TouchEvent) {
    wx.navigateTo({ url: `/pages/stock/edit/edit?id=${e.currentTarget.dataset.id}` });
  },
  onDelete(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    const target = getStock().find((it) => it.id === id);
    wx.showModal({
      title: '删除库存',
      content: `确定删除「${target ? ingredientName(target.ingredientId) : ''}」吗？`,
      confirmText: '删除',
      confirmColor: '#E03E3E',
      success: (res) => {
        if (!res.confirm) return;
        saveStock(getStock().filter((it) => it.id !== id));
        this.refresh();
        wx.showToast({ title: '已删除', icon: 'none' });
      },
    });
  },
});
