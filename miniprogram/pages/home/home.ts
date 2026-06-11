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

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

Page({
  data: {
    dateText: '',
    todayList: [] as TodayVM[],
    canMake: [] as CanMakeVM[],
    almost: [] as AlmostVM[],
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
    const canMake: CanMakeVM[] = [];
    const almost: AlmostVM[] = [];

    for (const r of recipes) {
      const mainText = mainNames(r).join('、') || '无主料';
      if (r.isToday) {
        todayList.push({ id: r.id, name: r.name, types: r.types, prep: r.prep, mainText });
      }
      const res = calcFridgeStatus(r, stock);
      if (res.status === 'ok') {
        canMake.push({ id: r.id, name: r.name, types: r.types, isToday: r.isToday, mainText });
      } else if (res.status === 'almost') {
        almost.push({ id: r.id, name: r.name, types: r.types, missingText: res.missingMain.join('、') });
      }
    }

    const autos = getAutoItems(recipes, stock);
    const manual = getShoppingItems();
    const names = [...autos.map((a) => a.name), ...manual.map((m) => m.name)];

    this.setData({
      todayList,
      canMake,
      almost,
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

  onAddToday(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    setToday(id, true);
    this.refresh();
    wx.showToast({ title: '已加入今天想吃', icon: 'none' });
  },

  onRemoveToday(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    setToday(id, false);
    this.refresh();
  },

  goShopping() {
    wx.navigateTo({ url: '/pages/shopping/shopping' });
  },
  goRecipes() {
    wx.switchTab({ url: '/pages/recipes/recipes' });
  },
});
