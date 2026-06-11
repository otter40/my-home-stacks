// app.ts — 小程序入口
import { isInitialized, setInitialized, saveRecipes, saveInventory } from './utils/storage';
import { seedRecipes, seedInventory } from './utils/seed';

App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 首次启动检测：本地无数据时写入 seed 示例数据
    if (!isInitialized()) {
      saveRecipes(seedRecipes());
      saveInventory(seedInventory());
      setInitialized(true);
    }
  },
});
