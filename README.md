# 枝脉 · 电子族谱

[English](README.en.md) | 简体中文

一个开源、可私有部署的电子族谱项目。它提供成员资料录入、亲属关系连接和可交互关系图，适合在个人电脑、家庭 NAS 或私人服务器上运行。

## 功能

- 成员资料：姓名、性别、生卒日期、世代、职业、居住地、电话、头像和人物小传
- 族谱品牌：可配置家族姓氏、印章字、族谱名称和顶部副标题
- 字辈诗文：族谱设置中填写字辈诗文，右上角点击"字辈"按段落展示，标点保留在字间，留空则隐藏按钮
- 亲属关系：父母子女、对象、兄弟姐妹、养父母、监护人与自定义关系
- 称呼查询：在主图依次点选两人，同时显示双方如何称呼，并给出可核对的关系路径
- 地域称呼：在族谱设置中统一维护方言叫法，例如“姑祖母 → 姑姑”“姑姑 → 嬢嬢”“叔叔 → 满满”
- 管理员模式：默认以浏览模式访问，管理员输入密码后才能新增、编辑、删除、导入和修改设置
- 展示模式：主图可在“全谱”和“纯直”间切换；纯直模式隐藏非本家对象及对象连线，只保留本家上下代脉络，并按代际从左到右、同代从上到下紧凑排列
- 关系图：自动分层布局、缩放、拖动、小地图和成员详情
- 数据管理：JSON 文件持久化、浏览器导入与导出备份
- 私有部署：支持 Node.js 直接运行和 Docker Compose
- 响应式界面：桌面端和移动端均可使用
- 多语言界面：在“设置”中切换简体中文、繁體中文或 English，语言偏好保存在当前浏览器

## 技术栈

- 前端：React 19、TypeScript、Vite、XYFlow、Dagre
- 后端：Node.js、Express 5、Zod
- 存储：服务端 JSON 文件，采用队列写入和临时文件替换，避免并发写坏数据
- 部署：Docker、Docker Compose

## 快速开始

需要 Node.js 20 或更高版本。

```bash
npm install
ADMIN_PASSWORD='请设置密码' SESSION_SECRET='请设置随机密钥' npm run dev
```

打开 [http://localhost:5173](http://localhost:5173)。开发模式下，前端会将 `/api` 请求代理到 `http://localhost:3000`。

生产模式：

```bash
npm run build
npm start
```

打开 [http://localhost:3000](http://localhost:3000)。

## Docker 部署

首次部署时，先复制环境变量示例：

```bash
cp .env.example .env
```

打开 `.env`，设置管理员密码，并使用下面的命令生成会话密钥：

```bash
openssl rand -hex 32
```

将生成的随机字符串填入 `SESSION_SECRET`，然后启动服务：

```bash
docker compose up -d --build
```

`.env` 已被 Git 忽略，不会随开源仓库提交。未配置管理员密码时，服务会安全地保持浏览模式，并关闭所有修改入口。

访问 [http://localhost:3000](http://localhost:3000)。数据保存在名为 `family-tree-data` 的 Docker volume 中，更新容器不会丢失。

查看日志或停止服务：

```bash
docker compose logs -f
docker compose down
```

如需连数据卷一起删除，请明确执行 `docker compose down -v`。此操作会永久删除族谱数据。

## 管理员密码与会话密钥

项目不会自动生成一个可在网页中查看的“管理员密钥”。每位自部署者都需要在自己的部署环境中设置以下两个变量：

| 环境变量 | 用途 | 是否需要记住 |
| --- | --- | --- |
| `ADMIN_PASSWORD` | 点击页面右上角“浏览”后，进入管理模式时输入的密码 | 需要，由部署者保管 |
| `SESSION_SECRET` | 服务端签名管理员登录会话的随机密钥，不是登录密码 | 不需要日常使用，但应稳定保存 |

Docker Compose 部署时，这两个值通常保存在项目目录的 `.env` 文件中：

```dotenv
ADMIN_PASSWORD=your-strong-admin-password
SESSION_SECRET=paste-the-output-of-openssl-rand-hex-32-here
```

因此，别人从 GitHub、GitLab、Gitee 等平台克隆项目后，需要自己执行 `cp .env.example .env` 并填写，不能使用仓库维护者的密码。`.env` 不会被提交，也不会随着 `git pull` 被覆盖。

### 在哪里查看

- Docker Compose：查看部署服务器上项目目录中的 `.env` 文件。不要把文件内容截图、粘贴到 Issue 或提交到仓库。
- Node.js、systemd、面板或 NAS：查看启动服务时配置的环境变量或服务配置文件。
- 云托管平台：在项目的 Environment Variables、Variables 或 Secrets 设置中管理。部分平台出于安全原因只允许覆盖，不能再次显示原值；忘记后直接设置新值即可。
- 网页管理界面不会显示 `ADMIN_PASSWORD` 或 `SESSION_SECRET`，API 也不会返回它们。

### 忘记密码或需要重置

Docker Compose 部署可直接修改 `.env` 中的 `ADMIN_PASSWORD`，然后重新创建容器：

```bash
docker compose up -d --force-recreate
```

仅修改 `ADMIN_PASSWORD` 后，已经登录的浏览器会话最长仍可保持 12 小时。如果需要立即让所有旧管理员会话失效，请同时重新生成 `SESSION_SECRET`，再重新创建容器：

```bash
openssl rand -hex 32
docker compose up -d --force-recreate
```

修改环境变量不会删除族谱数据。不要使用 `docker compose down -v` 来重置密码，因为 `-v` 会删除数据卷。

### 安全边界

- `ADMIN_PASSWORD` 和 `SESSION_SECRET` 只属于当前部署实例，不会包含在族谱 JSON 的导入、导出文件中。
- `SESSION_SECRET` 应与 `ADMIN_PASSWORD` 使用不同的值；生产环境不要使用 `.env.example` 中的示例值。
- 为兼容已有部署，未单独设置 `SESSION_SECRET` 时程序会暂时使用 `ADMIN_PASSWORD` 签名会话，但公开部署应始终配置独立的随机密钥。
- `.env.example` 可以提交到 Git；真正使用的 `.env`、平台 Secrets 和真实族谱备份不能提交。
- 管理员模式只限制修改权限，普通访客仍能浏览族谱。公网部署真实数据时仍应增加 HTTPS 和访问层认证。

## 导入示例数据

启动项目后，在左下角选择“导入数据”，导入 [examples/family-tree.sample.json](examples/family-tree.sample.json)，即可看到一份虚构的三代关系图。

### 50 人五代测试数据

```bash
npm run demo:generate -- --import
```

生成的文件位于 `examples/family-tree-50.demo.json`，导入到本机 `localhost:3000`。

### 80 人九代测试数据（近 200 年）

覆盖 1826 至 2025 年、9 代 80 位虚构成员（含 27 位已故成员），适合演示长周期谱系与压力测试：

```bash
npm run demo:generate-80 -- --import
```

生成的文件位于 `examples/family-tree-80.demo.json`。若服务运行在其他端口（如 Docker 映射的 `3001`），通过 `--port` 指定：

```bash
npm run demo:generate-80 -- --import --port 3001
```

执行导入前请先导出或备份当前真实数据。

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

## 查询亲属称呼

点击顶部“查称呼”，再在主图中依次选择两位成员。系统会同时显示第一位如何称呼第二位、第二位如何称呼第一位；常见直系、叔伯姑舅姨、侄甥、堂表亲、祖辈旁系和姻亲会显示标准称呼，更远的关系会显示代际称呼及完整关系路径。

不同地区的叫法集中在“族谱设置 → 地域称呼”中维护。结果会优先显示当地叫法，同时保留普通话标准称呼。自定义设置会随 JSON 备份一同导入、导出。

## API 概览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/auth/status` | 获取当前管理模式状态 |
| `POST` | `/api/auth/login` | 管理员登录 |
| `POST` | `/api/auth/logout` | 退出管理模式 |
| `GET` | `/api/family` | 获取完整族谱 |
| `PATCH` | `/api/family` | 修改族谱名称与简介 |
| `POST` | `/api/people` | 添加成员 |
| `PUT` | `/api/people/:id` | 修改成员 |
| `DELETE` | `/api/people/:id` | 删除成员及其关系 |
| `POST` | `/api/relations` | 添加关系 |
| `DELETE` | `/api/relations/:id` | 删除关系 |
| `POST` | `/api/import` | 导入并覆盖族谱数据 |

除读取族谱和认证接口外，所有修改接口都需要有效的管理员会话。

`apps/api/data/*.json` 已加入 `.gitignore`，避免将真实家人资料误传到公开仓库。示例数据位于单独的 `examples` 目录，内容均为虚构。

## 隐私和生产安全

当前版本内置管理员写权限，但普通访客仍可读取完整族谱。若真实族谱部署到公网，请继续放在带成员身份验证的反向代理、VPN 或零信任网关之后，并启用 HTTPS。管理员模式解决的是“谁能修改”，不是“谁能查看”。不要将包含电话、生卒信息等隐私数据的导出文件提交到任何公开仓库。

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
