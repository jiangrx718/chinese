# Chinese Page

一个基于 React + TypeScript + Vite 的中国古籍阅读平台前端项目，提供书籍列表、书籍详情和在线阅读功能。

## 项目简介

本项目采用现代化的前端技术栈构建，旨在提供流畅、简洁的中国古籍阅读体验，特别适配移动端（H5）阅读场景。

## 技术栈

- **框架**: React 19.1.0
- **语言**: TypeScript
- **构建工具**: Vite 6.3.5
- **路由**: React Router DOM 7.6.1
- **UI 组件库**: Ant Design 5.25.3
- **图表库**: ECharts 5.6.0
- **HTTP 客户端**: Axios 1.9.0

## 项目结构

```
chinese-page/
├── public/           # 静态资源
├── src/
│   ├── assets/       # 资源文件
│   ├── components/   # 公共组件
│   │   ├── PageHeader.tsx
│   │   └── SideMenu.tsx
│   ├── pages/        # 页面组件
│   │   ├── BookList.tsx      # 书籍列表
│   │   ├── BookDetail.tsx    # 书籍详情
│   │   └── BookReader.tsx    # 书籍阅读器
│   ├── styles/       # 样式文件
│   ├── types/        # TypeScript 类型定义
│   ├── utils/        # 工具函数
│   ├── App.tsx       # 根组件
│   ├── config.ts     # 配置文件
│   └── main.tsx      # 入口文件
├── dist/             # 构建输出目录
├── Dockerfile        # Docker 镜像构建配置
├── package.json      # 项目依赖配置
├── tsconfig.json     # TypeScript 配置
├── vite.config.ts    # Vite 配置
└── index.html        # HTML 模板
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173 查看项目

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 路由说明

- `/` - 书籍列表页
- `/book/:id` - 书籍详情页
- `/reader/:id` - 书籍阅读页

## API 配置

API 基础地址在 [src/config.ts](src/config.ts) 中配置：

```typescript
// 本地开发环境
const isLocal = typeof window !== 'undefined' && window.location.origin.startsWith('http://localhost');
export const API_BASE_URL = isLocal ? 'http://127.0.0.1:8080' : 'http://10.1.76.218:8080';
```

根据部署环境自动切换本地或远程 API 地址。

## Docker 部署

### 构建镜像

```bash
docker buildx build \
  --platform linux/amd64 \
  -t chinese-page:1.0.0-amd64 \
  --output type=docker \
  .
```

### 保存镜像

```bash
docker save -o /Users/jiang/jiangrx816/docker-images/chinese-page-1.0.0-amd64.tar chinese-page:1.0.0-amd64
```

### 上传到服务器

```bash
scp /Users/jiang/jiangrx816/docker-images/chinese-page-1.0.0-amd64.tar root@182.92.84.106:/data/project/chinese
```

### 服务器加载并运行

```bash
# 加载镜像
docker load -i chinese-page-1.0.0-amd64.tar

# 运行容器
./start-page.sh
```

## 相关项目

- [Chinese API](https://github.com/jiangrx718/chinese-api) - 后端 API 服务

## 开发说明

- 使用 HashRouter 以支持各种部署环境
- 采用 Ant Design 组件库构建 UI
- 针对 H5 阅读场景进行优化，移除了顶部导航栏
- 支持响应式布局，适配移动端和桌面端

## License

MIT
