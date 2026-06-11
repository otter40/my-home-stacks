// pages/profile/profile.ts — 我的：使用统计 + 数据备份 + 分类管理入口 + 清空/重置
import {
  SCHEMA_VERSION,
  clearAll,
  setInitialized,
  setSchemaVersion,
  saveIngredients,
  saveStock,
  saveRecipes,
  saveShoppingItems,
  saveCookHistory,
  saveCustomOptions,
  getIngredients,
  getRecipes,
  getStock,
  getShoppingItems,
  getCookHistory,
  getCustomOptions,
} from '../../utils/storage';
import { buildSeed } from '../../utils/seed';
import { totalCooked, weeklyCooked, topDishes } from '../../utils/stats';

Page({
  data: {
    total: 0,
    weekly: 0,
    topList: [] as Array<{ name: string; count: number }>,
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    this.setData({
      total: totalCooked(),
      weekly: weeklyCooked().length,
      topList: topDishes(5),
    });
  },

  goOptions() {
    wx.navigateTo({ url: '/pages/options/options' });
  },

  /** 导出全部数据到剪贴板 */
  onExport() {
    const dump = {
      schemaVersion: SCHEMA_VERSION,
      ingredients: getIngredients(),
      recipes: getRecipes(),
      stock: getStock(),
      shoppingItems: getShoppingItems(),
      cookHistory: getCookHistory(),
      customOptions: getCustomOptions(),
    };
    wx.setClipboardData({
      data: JSON.stringify(dump),
      success: () => wx.showToast({ title: '已复制到剪贴板', icon: 'none' }),
    });
  },

  /** 从剪贴板导入（覆盖现有数据） */
  onImport() {
    wx.getClipboardData({
      success: (res) => {
        let dump: Record<string, unknown>;
        try {
          dump = JSON.parse(res.data);
        } catch (e) {
          wx.showModal({ title: '导入失败', content: '剪贴板内容不是有效的备份数据', showCancel: false });
          return;
        }
        if (!dump || (dump as { schemaVersion?: number }).schemaVersion !== SCHEMA_VERSION) {
          wx.showModal({ title: '导入失败', content: '备份数据版本不匹配', showCancel: false });
          return;
        }
        wx.showModal({
          title: '导入数据',
          content: '将用剪贴板中的备份覆盖当前全部数据，确定吗？',
          confirmText: '导入',
          success: (r) => {
            if (!r.confirm) return;
            const d = dump as Record<string, never>;
            saveIngredients((d.ingredients as never) || []);
            saveRecipes((d.recipes as never) || []);
            saveStock((d.stock as never) || []);
            saveShoppingItems((d.shoppingItems as never) || []);
            saveCookHistory((d.cookHistory as never) || []);
            saveCustomOptions(
              (d.customOptions as never) || {
                recipeTypes: [], cuisines: [], ingredientCategories: [], locations: [], stockStatuses: [],
              }
            );
            setInitialized(true);
            setSchemaVersion(SCHEMA_VERSION);
            this.refresh();
            wx.showToast({ title: '导入成功', icon: 'success' });
          },
        });
      },
      fail: () => wx.showModal({ title: '导入失败', content: '无法读取剪贴板', showCancel: false }),
    });
  },

  /** 恢复示例数据 */
  onReset() {
    wx.showModal({
      title: '恢复示例数据',
      content: '将清空当前数据并写入示例数据，确定吗？',
      confirmText: '恢复',
      confirmColor: '#E03E3E',
      success: (res) => {
        if (!res.confirm) return;
        clearAll();
        const s = buildSeed();
        saveIngredients(s.ingredients);
        saveStock(s.stock);
        saveRecipes(s.recipes);
        setInitialized(true);
        setSchemaVersion(SCHEMA_VERSION);
        this.refresh();
        wx.showToast({ title: '已恢复示例', icon: 'success' });
      },
    });
  },

  /** 清空全部数据 */
  onClear() {
    wx.showModal({
      title: '清空全部数据',
      content: '将删除所有食材、菜谱、库存、购物袋和历史，且不可恢复，确定吗？',
      confirmText: '清空',
      confirmColor: '#E03E3E',
      success: (res) => {
        if (!res.confirm) return;
        clearAll();
        // 保留版本号与初始化标记，避免下次启动自动重新写 seed
        setInitialized(true);
        setSchemaVersion(SCHEMA_VERSION);
        this.refresh();
        wx.showToast({ title: '已清空', icon: 'none' });
      },
    });
  },
});
