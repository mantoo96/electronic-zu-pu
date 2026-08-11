import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { JsonStore } from "./store.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const dataFile = process.env.DATA_FILE || path.resolve(currentDir, "../data/family-tree.json");
const port = Number(process.env.PORT || 3000);
const adminPassword = process.env.ADMIN_PASSWORD;
const sessionSecret = process.env.SESSION_SECRET;

const app = createApp(new JsonStore(dataFile), { adminPassword, sessionSecret });
app.listen(port, "0.0.0.0", () => {
  console.log(`电子族谱服务已启动：http://localhost:${port}`);
  if (!adminPassword) console.warn("未配置 ADMIN_PASSWORD，服务将保持浏览模式并关闭所有修改接口");
});
