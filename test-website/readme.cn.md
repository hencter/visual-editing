# 测试网站

> [!注意]  
> 以下测试网站和指南仅用于测试和开发目的，不可用于生产环境！

本测试网站基于 [@directus-labs](https://github.com/directus-labs/) 的 Simple CMS 初始模板构建。

## 设置说明

虽然您也可以通过运行在 [Docker](https://directus.io/docs/getting-started/create-a-project#docker-installation) 容器中的 Directus 实例来设置可视化编辑测试网站，但本指南将介绍如何使用官方 Directus 仓库设置开发环境。

### 设置您的 Directus 开发实例

1. 克隆官方 [Directus GitHub 仓库](https://github.com/directus/directus)，确保已安装依赖项（`pnpm i`）并完成构建（`pnpm build`）！
2. 创建一个新数据库（推荐使用 sqlite 进行开发），并在 `api/.env` 中添加环境配置

    **示例 .env 文件**

    ```sh
    PUBLIC_URL=http://localhost:8080
    KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    ADMIN_EMAIL=admin@directus.io
    ADMIN_PASSWORD=secret
    CACHE_ENABLED=true
    CACHE_AUTO_PURGE=true
    CACHE_TTL=1d
    CORS_ENABLED=true
    CORS_ORIGIN=http://localhost:3000
    CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC=http://localhost:3000
    DB_CLIENT=sqlite3
    DB_FILENAME=db.sqlite3
    ```

3. 再次确认以下环境变量已设置：

    ```sh
     CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC=http://localhost:3000
     CACHE_AUTO_PURGE=true
    ```

4. 运行 `pnpm --filter api cli bootstrap` 以设置数据库  
5. 运行开发服务器：`pnpm --filter api dev` 和 `pnpm --filter app dev`  
6. 登录 Directus Studio，为您的用户创建令牌并保存好  

### 设置测试网站

1. 克隆独立的 [可视化编辑库仓库](https://github.com/directus/visual-editing)，在代码编辑器中新窗口打开并切换到 `main` 分支  
2. 将环境变量添加到 `test-website/simple-cms/nuxt/.env`，确保提供 `<your-token>` 和正确的 `DIRECTUS_URL`  

   ```sh
   DIRECTUS_URL=http://localhost:8080
   DIRECTUS_FORM_TOKEN=<your-token>
   DIRECTUS_SERVER_TOKEN=<your-token>
   NUXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. 现在安装 Directus 模板  

   ```sh
   cd test-website/template && npm run setup-directus
   ```

   在 Windows 上，使用以下命令并确保将 `<directus-url>` 替换为您的 Directus URL，`<your-token>` 替换为您之前生成的令牌。  

   ```sh
   cd test-website/template && npx directus-template-cli@latest apply -p --directusUrl=<directus-url> --templateLocation=. --templateType=local --directusToken=<your-token>
   ```

### 设置库

1. 从可视化编辑库仓库的根目录安装包：`pnpm i`  
2. 构建包：`pnpm build`  
3. 然后安装测试网站的依赖项：`cd test-website/simple-cms/nuxt/ && pnpm i`  
4. 从该文件夹（test-website/simple-cms/nuxt）运行：`pnpm visual-editing:ssr--refresh`  

> [!注意]  
> 请参阅下文“测试模式”的描述  

### 设置 Directus 可视化编辑器模块

1. 切换到 Directus Studio  
2. 在设置中启用可视化编辑器模块  
3. 将以下 URL 添加到可视化编辑器设置中（在设置页面）  

   - `http://localhost:3000`  
   - `http://localhost:3000/blog`  
   - `http://localhost:3000/blog/why-steampunk-rabbits-are-the-future-of-work`  

     > [!注意]  
     > 最后两个 URL 仅用于测试。您无需将网站的每个页面 URL 都添加到可视化编辑器中即可访问它们。  

4. 打开可视化编辑器模块  

## 测试模式

使用以下命令运行预定义的测试环境。通过在 test-website 目录中搜索 `useVisualEditingTest` 或 `testCase` 来查看相应的代码设置。

> [!注意]  
> 确保停止其他运行在 localhost:3000 上的服务器  

```sh
# 命令

pnpm visual-editing:monolith

pnpm visual-editing:ssr
pnpm visual-editing:ssr--refresh-all
pnpm visual-editing:ssr--refresh
pnpm visual-editing:ssr--refresh-customized # http://localhost:3000/blog
pnpm visual-editing:ssr--methods # http://localhost:3000

pnpm visual-editing:dev
pnpm visual-editing:dev--refresh-all
pnpm visual-editing:dev--refresh
pnpm visual-editing:dev--refresh-customized # http://localhost:3000/blog
pnpm visual-editing:dev--methods # http://localhost:3000

pnpm visual-editing:ssg # http://localhost:3000/blog/why-steampunk-rabbits-are-the-future-of-work
```

### 渲染模式

- 单体 / 仅服务器渲染：与 PHP 类似  
- SSG：仅在 hydration 时使用实时数据  
- SSR：始终使用实时数据  
- 开发模式：用于调试  

### 测试用例

- `basic`  
  - 无 `onSaved` 回调 —— iframe 内的网页将重新加载（`window.location.reload()`）  
  - 可编辑元素在路由变更时全局添加和移除  
  - 渲染模式：`monolith` || `dev` || `ssr`  
  - 搜索 `testCase === 'basic'`  
- `refresh-all`  
  - `onSaved` 将通过 `refreshNuxtData()` 重新获取所有数据  
  - 可编辑元素在路由变更时全局添加和移除  
  - 渲染模式：`dev` || `ssr`  
  - 搜索 `testCase === 'refresh-all'`  
- `refresh`（流畅，推荐）  
  - `onSaved` 将调用原始数据获取处的重新获取方法。  
  - 可编辑元素仅在路由变更时全局移除，它们在嵌套组件中（数据获取处）添加，以便将 `refresh()` 函数传递给 `onSaved`。这应提供最流畅的体验，避免布局偏移。  
  - 渲染模式：`dev` || `ssr`  
  - 搜索 `testCase === 'refresh'`  
- `refresh-customized`  
  - 在测试网站上查看此模式的最佳方式是打开此页面：<http://localhost:3000/blog>  
  - 与上述 `refresh` 完全相同，只是某些可编辑元素附加了自定义类以展示可定制性。  
  - 渲染模式：`dev` || `ssr`  
  - 搜索 `testCase === 'refresh-customized'`  
- `methods`  
  - 在测试网站上查看此模式的最佳方式是打开此页面：<http://localhost:3000>  
  - 与上述 `basic` 完全相同，但包含用于测试实用功能/方法的按钮  
  - 渲染模式：`dev` || `ssr`  
  - 搜索 `testCase === 'methods'`  
- `refresh-ssg`  
  - 在测试网站上查看此模式的最佳方式是打开此页面：<http://localhost:3000/blog/why-steampunk-rabbits-are-the-future-of-work>  
  - 与上述 `refresh` 完全相同，但仅适用于 SSG 且位于博客页面 `/blog/[slug]`  
  - 渲染模式：`ssg`  
  - 搜索 `testCase === 'refresh-ssg’`
