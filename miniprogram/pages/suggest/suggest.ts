// pages/suggest/suggest.ts — 冰箱能做什么（子页面）
import { getRecipes, getStock } from '../../utils/storage';
import { calcFridgeStatus, mainNames, setToday } from '../../utils/recipe';

interface CanMakeVM {
  id: string;
  name: string;
  types: string[];
  isToday: boolean;
  mainText: string;
}
interface AlmostVM {
  id: string;
  name: string;
  types: string[];
  missingText: string;
}

Page({
  data: {
    canMake: [] as CanMakeVM[],
    almost: [] as AlmostVM[],
    hasAny: false,
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const stock = getStock();
    const canMake: CanMakeVM[] = [];
    const almost: AlmostVM[] = [];
    for (const r of getRecipes()) {
      const res = calcFridgeStatus(r, stock);
      if (res.status === 'ok') {
        canMake.push({
          id: r.id, name: r.name, types: r.types, isToday: r.isToday,
          mainText: mainNames(r).join('、') || '无主料',
        });
      } else if (res.status === 'almost') {
        almost.push({ id: r.id, name: r.name, types: r.types, missingText: res.missingMain.join('、') });
      }
    }
    this.setData({ canMake, almost, hasAny: canMake.length > 0 || almost.length > 0 });
  },

  onAddToday(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    setToday(id, true);
    this.refresh();
    wx.showToast({ title: '已加入今天想吃', icon: 'none' });
  },
});
