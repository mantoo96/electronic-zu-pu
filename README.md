# 枝脉 · 电子族谱

一个开源、可私有部署的电子族谱项目。它提供成员资料录入、亲属关系连接和可交互关系图，适合在个人电脑、家庭 NAS 或私人服务器上运行。

## 功能

- 成员资料：姓名、性别、生卒日期、世代、职业、居住地、电话、头像和人物小传
- 族谱品牌：可配置家族姓氏、印章字、族谱名称和顶部副标题
- 亲属关系：父母子女、配偶、兄弟姐妹、养父母、监护人与自定义关系
- 关系图：自动分层布局、缩放、拖动、小地图和成员详情
- 数据管理：JSON 文件持久化、浏览器导入与导出备份
- 私有部署：支持 Node.js 直接运行和 Docker Compose
- 响应式界面：桌面端和移动端均可使用

## 技术栈

- 前端：React 19、TypeScript、Vite、XYFlow、Dagre
- 后端：Node.js、Express 5、Zod
- 存储：服务端 JSON 文件，采用队列写入和临时文件替换，避免并发写坏数据
- 部署：Docker、Docker Compose

## 快速开始

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

打开 [http://localhost:5173](http://localhost:5173)。开发模式下，前端会将 `/api` 请求代理到 `http://localhost:3000`。

生产模式：

```bash
npm run build
npm start
```

打开 [http://localhost:3000](http://localhost:3000)。

## Docker 部署

```bash
docker compose up -d --build
```

访问 [http://localhost:3000](http://localhost:3000)。数据保存在名为 `family-tree-data` 的 Docker volume 中，更新容器不会丢失。

查看日志或停止服务：

```bash
docker compose logs -f
docker compose down
```

如需连数据卷一起删除，请明确执行 `docker compose down -v`。此操作会永久删除族谱数据。

## 导入示例数据

启动项目后，在左下角选择“导入数据”，导入 [examples/family-tree.sample.json](examples/family-tree.sample.json)，即可看到一份虚构的三代关系图。

生成并导入 50 人五代测试数据：

```bash
npm run demo:generate -- --import
```

生成的文件位于 `examples/family-tree-50.demo.json`。执行导入前请先导出或备份当前真实数据。

## 数据与备份

本机直接运行时，默认数据文件是：

```text
apps/api/data/family-tree.json
```

可使用环境变量指定其他位置：

```bash
DATA_FILE=/srv/family-tree/data.json npm start
```

建议定期使用界面中的“导出备份”，或备份服务器上的数据文件/数据卷。

## API 概览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/family` | 获取完整族谱 |
| `PATCH` | `/api/family` | 修改族谱名称与简介 |
| `POST` | `/api/people` | 添加成员 |
| `PUT` | `/api/people/:id` | 修改成员 |
| `DELETE` | `/api/people/:id` | 删除成员及其关系 |
| `POST` | `/api/relations` | 添加关系 |
| `DELETE` | `/api/relations/:id` | 删除关系 |
| `POST` | `/api/import` | 导入并覆盖族谱数据 |

## 推送代码到多个平台

本项目支持同时托管在 Gitee、GitHub 与 GitCode 三个平台。约定使用三个远程仓库别名：`origin`（Gitee）、`github`（GitHub）、`gitcode`（GitCode），**`main` 分支每次都要同步推送到全部三个平台**。

### 首次初始化与推送

```bash
git init
git add .
git commit -m "feat: initial electronic family tree"
git branch -M main

# 添加三个平台的远程仓库（替换为你的用户名与仓库名）
git remote add origin  https://gitee.com/你的用户名/你的仓库名.git
git remote add github https://github.com/你的用户名/你的仓库名.git
git remote add gitcode https://gitcode.com/你的用户名/你的仓库名.git

# 依次推送到全部平台
git push origin main
git push github main
git push gitcode main
```

### 日常推送规则

每次提交后，**三个平台都必须推送**，保持仓库内容一致：

```bash
git push origin main && git push github main && git push gitcode main
```

也可以逐条执行、分别观察各平台的推送结果：

```bash
git push origin main; git push github main; git push gitcode main
```

如果只想推送到其中某个平台，直接指定对应的 remote 别名即可，例如 `git push github main`。

### 平台认证说明

- **Gitee**：支持用户名 + 密码或私人令牌。
- **GitHub**：需要 Personal Access Token；国内网络下建议为 git 配置代理后再推送。
- **GitCode**：**仅支持 Personal Access Token，已移除密码认证**。将令牌存入系统钥匙串后可免密推送（macOS 示例）：

```bash
printf "protocol=https\nhost=gitcode.com\nusername=你的用户名\npassword=你的令牌\n" | git credential-osxkeychain store
```

`apps/api/data/*.json` 已加入 `.gitignore`，避免将真实家人资料误传到公开仓库。示例数据位于单独的 `examples` 目录，内容均为虚构。

## 隐私和生产安全

当前版本定位为家庭内网或受信任的私人服务器，未内置账号登录。若部署到公网，请至少放在带身份验证的反向代理、VPN 或零信任网关之后，并启用 HTTPS。不要将包含电话、生卒信息等隐私数据的导出文件提交到任何公开仓库（Gitee / GitHub / GitCode）。

## 项目结构

```text
.
├── apps
│   ├── api          # Express API 与文件存储
│   └── web          # React 前端与关系图
├── examples         # 可公开的虚构示例数据
├── compose.yaml
└── Dockerfile
```

## 常用命令

```bash
npm run dev      # 同时启动前后端开发服务
npm run build    # 构建生产版本
npm test         # 运行测试
npm run lint     # TypeScript 静态检查
```

## License

[MIT](LICENSE)
