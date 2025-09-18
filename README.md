# NewPushNode 项目

这是一个基于 Vue 3、TypeScript 和 Vite 的项目，使用了多个流行的库和插件来增强功能和开发体验。

## 项目简介

- **Vue 版本**: 3.5.13
- **TypeScript 版本**: ~5.4.5
- **Vite 版本**: ^6.0.1

### 主要依赖

- **UI 组件库**: Element Plus, VXE Table
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **图表库**: ECharts
- **实用工具库**: Lodash, XE Utils

## 安装步骤

1. 克隆项目到本地：

   ```bash
   git clone <项目仓库地址>
   ```

2. 进入项目目录：

   ```bash
   cd newpushnode
   ```

3. 安装依赖（请确保已安装 pnpm）：

   ```bash
   pnpm install
   ```

## 使用说明

### 开发环境

启动开发服务器并自动打开浏览器：

```bash
pnpm run dev
```

### 构建项目

#### 测试环境构建

```bash
pnpm run build:test
```

#### 生产环境构建

```bash
pnpm run build:prod
```

### 预览构建结果

在本地预览构建后的项目：

```bash
pnpm run preview
```

## 贡献

欢迎对本项目进行贡献！请确保在提交代码前运行所有测试并遵循项目的代码风格。

## 许可证

本项目采用 MIT 许可证。
