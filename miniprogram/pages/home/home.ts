// pages/home/home.ts — 首页：欢迎 + 今天想吃 + 冰箱建议 + 购物袋摘要
import { getRecipes, getStock, getShoppingItems } from '../../utils/storage';
import { calcFridgeStatus, mainNames, setToday, cookDone } from '../../utils/recipe';
import { getAutoItems } from '../../utils/shopping';

interface TodayVM {
  id: string;
  name: string;
  types: string[];
  prep: string;
  mainText: string;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

Page({
  data: {
    dateText: '',
    todayList: [] as TodayVM[],
    canMakeCount: 0,
    almostCount: 0,
    shoppingCount: 0,
    shoppingPreview: '' as string,
  },

  onLoad() {
    const d = new Date();
    this.setData({
      dateText: `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[d.getDay()]}`,
    });
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const recipes = getRecipes();
    const stock = getStock();

    const todayList: TodayVM[] = [];
    let canMakeCount = 0;
    let almostCount = 0;

    for (const r of recipes) {
      if (r.isToday) {
        todayList.push({
          id: r.id, name: r.name, types: r.types, prep: r.prep,
          mainText: mainNames(r).join('、') || '无主料',
        });
      }
      const res = calcFridgeStatus(r, stock);
      if (res.status === 'ok') canMakeCount++;
      else if (res.status === 'almost') almostCount++;
    }

    const autos = getAutoItems(recipes, stock);
    const manual = getShoppingItems();
    const names = [...autos.map((a) => a.name), ...manual.map((m) => m.name)];

    this.setData({
      todayList,
      canMakeCount,
      almostCount,
      shoppingCount: names.length,
      shoppingPreview: names.slice(0, 3).join('、'),
    });
  },

  onDone(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    const recipe = getRecipes().find((r) => r.id === id);
    if (!recipe) return;
    cookDone(recipe);
    this.refresh();
    wx.showToast({ title: '完成啦 🎉，已扣库存', icon: 'none' });
  },

  onRemoveToday(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    setToday(id, false);
    this.refresh();
  },

  goSuggest() {
    wx.navigateTo({ url: '/pages/suggest/suggest' });
  },
  goShopping() {
    wx.navigateTo({ url: '/pages/shopping/shopping' });
  },
});
