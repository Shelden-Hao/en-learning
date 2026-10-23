# en-learning

一个英语学习平台的 monorepo：前端学习站点 + 埋点 SDK + NestJS 服务端。

## 技术栈

| 模块 | 技术 |
| :--- | :--- |
| `apps/web` | Vue 3 + Vite + TypeScript + Element Plus + Tailwind CSS 4，SSE 流式对话 |
| `apps/tracker` | 自研埋点 SDK（`pv` 等上报方法），以 workspace 包形式接入 web |
| `server` | NestJS + Prisma，`docker-compose.yml` 提供本地依赖服务 |
| `packages/*` | 共享的 common / config 等基础包 |

## 目录结构

```
en-learning/
├── apps/
│   ├── web/          # 前端学习站点
│   └── tracker/      # 埋点 SDK
├── packages/         # 共享包（common、config ...）
├── server/           # NestJS 服务端 + Prisma
├── scripts/
└── pnpm-workspace.yaml
```

## 快速开始

```bash
# 1. 安装依赖（workspace 全量）
pnpm install

# 2. 配置服务端环境变量
cp server/.env.example server/.env

# 3. 启动本地依赖（数据库等，配置见 server/docker-compose.yml）
cd server && docker compose up -d && cd ..

# 4. 初始化数据库（Prisma）
pnpm --filter @en-learning/server exec prisma migrate dev
```

## 启动

```bash
pnpm run all      # 同时启动 web + server + ai
pnpm run web      # 只启动前端
pnpm run server   # 只启动 NestJS 服务端
pnpm run ai       # 启动服务端的 ai 入口
```

## 说明

- 包管理工具统一使用 **pnpm**（见 `pnpm-workspace.yaml`）。
- 环境变量、数据库连接等本地配置不要提交到仓库，`.env` 已在 `.gitignore` 中。
