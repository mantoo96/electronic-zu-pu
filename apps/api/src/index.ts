import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { JsonStore } from "./store.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const dataFile = process.env.DATA_FILE || path.resolve(currentDir, "../data/family-tree.json");
const port = Number(process.env.PORT || 3000);

const app = createApp(new JsonStore(dataFile));
app.listen(port, "0.0.0.0", () => {
  console.log(`电子族谱服务已启动：http://localhost:${port}`);
});
