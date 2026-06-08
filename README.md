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

推荐使用一键命令创建文章：

```powershell
npm run new-post -- "我的新文章标题" 学习 Astro 写作
```

第一个参数是文章标题，第二个参数是分类，后面的参数都是标签。分类只能使用 `项目`、`学习`、`生活` 三种之一。

如果只传标题，默认分类是 `学习`，默认标签是 `写作`：

```powershell
npm run new-post -- "我的新文章标题"
```

如果要传标签，必须先写分类。例如上面的命令会把文章归到 `学习` 分类，并添加 `Astro`、`写作` 两个标签。

命令会在 `src/content/posts/` 下创建 Markdown 文件，并默认写入：

```yaml
draft: true
```

## Blog customization reference

Use `settings/settings.json` for site-wide customization. It controls the site identity (`site.name`, `site.title`, `site.description`, `site.author`, `site.brandInitial`), homepage copy (`home.*`), contact links (`contactLinks`), and footer text (`site.footerText`). Update this file when changing the blog name, hero/About/Contact copy, email link, GitHub link, or footer.

Add or edit posts in `src/content/posts/*.md`. Each Markdown file contains frontmatter followed by the article body. Use `draft: true` to keep a post unpublished, and set `draft: false` or remove the field when it is ready.

To add an article cover image, place the file in `public/images/posts/` and reference it from post frontmatter with a root-relative path:

```yaml
image: "/images/posts/example.svg"
```

Cover images render on the homepage featured story, homepage post cards, and article detail pages. The site base path is applied automatically, so do not include `/GitHubWeb` in the frontmatter image path.

The site includes a custom `404.html` page for missing routes. It gives readers links back to the homepage, archive, and article list.

Article pages include estimated reading time, a fixed reading-progress bar, a back-to-top button, previous/next article navigation, and visit counters. Site visits appear in the footer, and page visits appear below each article title. Reading time is calculated from Markdown content during the build.

Browser scripts are authored in `src/scripts/*` and mirrored into `public/scripts/*` for static serving. When changing one of these scripts, keep the public copy synchronized and verify with:

```powershell
npm.cmd run verify:public-scripts
```

写完文章后，把 `draft` 改为 `false`，或删除这一行，再提交并推送即可发布。中文标题会自动生成安全的 `post-日期-短哈希.md` 文件名；英文标题会生成更可读的 slug 文件名。

也可以手动创建文章。在 `src/content/posts/` 下新建 Markdown 文件，例如：

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
image: "/images/posts/example.svg"
---
```

`category` 只能使用 `项目`、`学习`、`生活` 三种之一。

## 搜索、导航和统计

首页文章区支持站内搜索，可以按文章标题、摘要、分类和标签搜索。搜索框和分类筛选会同时生效：例如先点击 `学习` 分类，再搜索 `Astro`，首页只会显示 `学习` 分类中匹配 `Astro` 的文章。

每篇文章底部会显示上一篇和下一篇文章，方便按时间继续阅读。排序按发布日期从新到旧计算，草稿文章不会参与上一篇/下一篇导航。

页脚会显示本站访问量。每篇文章标题下方会显示眼睛图标和当前文章阅读量。访问统计脚本只会在非本地环境加载，本地 `localhost`、`127.0.0.1` 和 `::1` 访问不会污染统计数据。

## 配置联系方式

首页 Contact 区的联系方式由 Settings 文件配置：

```text
settings/settings.json
```

修改 `contactLinks` 数组即可增删链接：

```json
{
  "contactLinks": [
    { "label": "Email", "href": "mailto:hello@example.com" },
    { "label": "GitHub", "href": "https://github.com/你的用户名" },
    { "label": "公众号", "href": "https://example.com" }
  ]
}
```

`mailto:` 邮箱链接会直接打开邮件客户端，`https://` 外链会自动添加安全的 `rel="noreferrer"`。

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
/GitHubWeb/categories/learning/
```

文章的 `tags` 会自动生成标签页，例如：

```text
/GitHubWeb/tags/astro/
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
image: "/images/posts/example.svg"
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
