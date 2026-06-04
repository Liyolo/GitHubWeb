# Notes & Fieldwork

一个使用 Astro、Markdown 和 GitHub Pages 构建的个人博客。

## 本地开发

安装依赖：

```powershell
npm.cmd install
```

启动开发服务器：

```powershell
npm.cmd run dev
```

构建静态站点：

```powershell
npm.cmd run build
```

预览构建结果：

```powershell
npm.cmd run preview
```

## 写新文章

在 `src/content/posts/` 下新建 Markdown 文件，例如：

```text
src/content/posts/my-new-post.md
```

文章 frontmatter 示例：

```yaml
---
title: "文章标题"
description: "文章摘要，会显示在首页和 RSS 中。"
pubDate: 2026-06-02
category: "学习"
tags: ["Astro", "写作"]
featured: false
---
```

`category` 只能使用 `项目`、`学习`、`生活` 三种之一。

## 部署

推送到 `main` 分支后，GitHub Actions 会自动运行：

```powershell
npm ci
npm run build
```

构建产物位于 `dist/`，并由 GitHub Pages 发布。

## 分类、标签和目录

文章的 `category` 会自动生成分类页，例如：

```text
/categories/学习/
```

文章的 `tags` 会自动生成标签页，例如：

```text
/tags/Astro/
```

文章正文中的二级和三级标题会自动生成目录。建议长文章使用：

```markdown
## 一级段落标题

### 更细的小节
```

## SEO 和分享

每篇文章会自动生成基础 SEO、Open Graph、Twitter Card 和 `BlogPosting` JSON-LD metadata。

如果想给文章设置分享图，可以在 frontmatter 中添加：

```yaml
image: "/GitHubWeb/images/posts/example.jpg"
```

图片文件可以放在：

```text
public/images/posts/
```

## 草稿

如果文章暂时不想发布，可以设置：

```yaml
draft: true
```

设置为草稿后，文章不会出现在首页、归档、分类、标签和 RSS 中。
