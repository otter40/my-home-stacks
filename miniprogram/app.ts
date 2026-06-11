// app.ts — 小程序入口
import {
  SCHEMA_VERSION,
  getSchemaVersion,
  setSchemaVersion,
  setInitialized,
  isInitialized,
  clearAll,
  saveIngredients,
  saveStock,
  saveRecipes,
} from './utils/storage';
import { buildSeed } from './utils/seed';

/** 写入示例数据（首次启动 / 升级重置 / "我的"页恢复示例 均复用） */
export function writeSeed() {
  const seed = buildSeed();
  saveIngredients(seed.ingredients);
  saveStock(seed.stock);
  saveRecipes(seed.recipes);
  setInitialized(true);
  setSchemaVersion(SCHEMA_VERSION);
}

App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 数据结构版本不一致（含 v1 旧数据）→ 清空并写入 v2 seed
    if (getSchemaVersion() !== SCHEMA_VERSION) {
      clearAll();
      writeSeed();
      return;
    }
    // 同版本但未初始化（理论上不会发生）→ 补写
    if (!isInitialized()) writeSeed();
  },
});
