# Notes & Fieldwork

一个可直接部署到 GitHub Pages 的静态个人博客模板。

## 本地预览

直接打开 `index.html` 即可预览。这个项目没有构建步骤，也不需要安装依赖。

## 部署到 GitHub Pages

1. 在 GitHub 创建一个新仓库。
2. 把当前目录提交并推送到仓库的 `main` 分支。
3. 进入仓库 `Settings` -> `Pages`。
4. 在 `Build and deployment` 中选择 `GitHub Actions`。
5. 推送后等待 Actions 完成，GitHub 会给出 Pages 访问地址。

## 修改内容

- 首页内容在 `index.html`
- 样式在 `styles.css`
- 文章筛选逻辑在 `script.js`
- 文章页面在 `posts/`
- GitHub Pages 工作流在 `.github/workflows/pages.yml`
