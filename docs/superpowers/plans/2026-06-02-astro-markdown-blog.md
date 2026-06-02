# Astro Markdown Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the deployed static HTML personal blog into an Astro Markdown blog that keeps the current visual style, supports Markdown posts, generates article pages automatically, and deploys through GitHub Pages.

**Architecture:** Use Astro as a static site generator. Blog posts live in `src/content/posts/*.md` with typed frontmatter, pages render posts through Astro content collections, and GitHub Actions builds `dist/` before deploying to Pages.

**Tech Stack:** Astro, TypeScript config, Markdown content collections, `@astrojs/rss`, `@astrojs/sitemap`, GitHub Actions Pages deployment.

---

## File Structure

- Create: `package.json` for scripts and dependencies.
- Create: `astro.config.mjs` for site URL, GitHub Pages base path, sitemap integration, and trailing slash behavior.
- Create: `tsconfig.json` for Astro TypeScript defaults.
- Create: `src/content/config.ts` for typed blog post frontmatter.
- Create: `src/content/posts/build-notes.md`, `src/content/posts/hello-world.md`, `src/content/posts/reading-log.md` for migrated articles.
- Create: `src/layouts/BaseLayout.astro` for shared HTML shell, navigation, footer, metadata, and styles import.
- Create: `src/layouts/PostLayout.astro` for article page layout.
- Create: `src/pages/index.astro` for homepage, featured article, filters, about, and contact sections.
- Create: `src/pages/posts/[slug].astro` for generated article detail pages.
- Create: `src/pages/archive.astro` for chronological archive.
- Create: `src/pages/rss.xml.js` for RSS feed.
- Create: `src/styles/global.css` by migrating the current `styles.css`.
- Create: `src/scripts/filters.js` by migrating the current `script.js`.
- Modify: `.github/workflows/pages.yml` to install dependencies, build Astro, upload `dist/`, and deploy.
- Modify: `.gitignore` to ignore `node_modules/`, `dist/`, and `.astro/`.
- Modify: `README.md` with new local development and publishing workflow.
- Delete after migration: root `index.html`, root `styles.css`, root `script.js`, and `posts/*.html`.

## Task 1: Scaffold Astro Project Metadata

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create `package.json`**

Create `package.json` with this exact content:

```json
{
  "name": "githubweb-blog",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev --host 127.0.0.1",
    "build": "astro build",
    "preview": "astro preview --host 127.0.0.1"
  },
  "dependencies": {
    "@astrojs/rss": "^4.0.11",
    "@astrojs/sitemap": "^3.2.1",
    "astro": "^5.0.0"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

Create `astro.config.mjs` with this exact content:

```js
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://liyolo.github.io",
  base: "/GitHubWeb",
  trailingSlash: "always",
  integrations: [sitemap()],
});
```

This repository is published as `Liyolo/GitHubWeb`, so GitHub Pages serves it under `/GitHubWeb/`. If the repository is later renamed to `Liyolo.github.io`, update `site` to `https://liyolo.github.io` and remove `base`.

- [ ] **Step 3: Create `tsconfig.json`**

Create `tsconfig.json` with this exact content:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": "."
  }
}
```

- [ ] **Step 4: Update `.gitignore`**

Append these lines to `.gitignore`:

```gitignore
node_modules/
dist/
.astro/
```

- [ ] **Step 5: Install dependencies**

Run:

```powershell
npm.cmd install
```

Expected: command exits `0`, creates `package-lock.json`, and creates `node_modules/`.

- [ ] **Step 6: Run the first build check**

Run:

```powershell
npm.cmd run build
```

Expected: build fails because no Astro entry pages exist yet. Acceptable failure text includes `No pages found` or an Astro page discovery error.

- [ ] **Step 7: Commit scaffold**

Run:

```powershell
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore
git commit -m "chore: scaffold astro project"
```

Expected: commit succeeds.

## Task 2: Define Markdown Content Collection

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/posts/build-notes.md`
- Create: `src/content/posts/hello-world.md`
- Create: `src/content/posts/reading-log.md`

- [ ] **Step 1: Create `src/content/config.ts`**

Create `src/content/config.ts` with this exact content:

```ts
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(["项目", "学习", "生活"]),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

export const collections = { posts };
```

- [ ] **Step 2: Create `src/content/posts/build-notes.md`**

Create `src/content/posts/build-notes.md` with this exact content:

```markdown
---
title: "从零搭一个可以长期维护的个人网站"
description: "用最少的技术栈，把博客先发布出去，再把内容习惯养起来。"
pubDate: 2026-06-01
category: "项目"
tags: ["GitHub Pages", "个人网站", "写作系统"]
featured: true
---

个人网站最重要的不是技术栈有多华丽，而是它能不能稳定地承载更新。

这个版本选择了最朴素的静态页面：没有构建步骤，没有数据库，也没有复杂依赖。好处是部署简单、打开很快，日后迁移到框架也不会被早期选择绑住。

接下来可以逐步增加归档页、RSS、文章搜索和自定义域名。每一步都应该服务于写作，而不是让维护网站本身变成新的负担。
```

- [ ] **Step 3: Create `src/content/posts/hello-world.md`**

Create `src/content/posts/hello-world.md` with this exact content:

```markdown
---
title: "第一篇：为什么要重新开始写作"
description: "不是为了做一个完美博客，而是给持续思考留一个稳定出口。"
pubDate: 2026-05-28
category: "学习"
tags: ["写作", "学习笔记"]
featured: false
---

重新开始写作，通常不是因为已经想清楚了，而是因为需要一个地方慢慢想清楚。

博客像一张长期展开的工作台。今天放上一个问题，明天补一段观察，过几个月回头看，会发现自己曾经模糊的判断已经有了纹理。

第一阶段的目标很简单：持续记录，保持可读，不追求完美。
```

- [ ] **Step 4: Create `src/content/posts/reading-log.md`**

Create `src/content/posts/reading-log.md` with this exact content:

```markdown
---
title: "五月阅读记录：给注意力留白"
description: "几本书、几个段落，以及它们在日常里留下的回声。"
pubDate: 2026-05-20
category: "生活"
tags: ["阅读", "生活观察"]
featured: false
---

这个月最有用的阅读，不是读得最多的那几天，而是读完之后愿意停下来的时刻。

留白让一本书有机会进入现实：一句话变成一次散步里的念头，一个观点变成工作时的判断，一个故事改变了看待他人的角度。

记录这些片段，是为了让阅读不只停在输入，而能慢慢变成生活的一部分。
```

- [ ] **Step 5: Commit content collection**

Run:

```powershell
git add src/content/config.ts src/content/posts
git commit -m "feat: add markdown post collection"
```

Expected: commit succeeds.

## Task 3: Build Shared Layouts and Styles

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/layouts/PostLayout.astro`
- Create: `src/styles/global.css`
- Create: `src/scripts/filters.js`

- [ ] **Step 1: Create `src/layouts/BaseLayout.astro`**

Create `src/layouts/BaseLayout.astro` with this exact content:

```astro
---
import "../styles/global.css";

interface Props {
  title?: string;
  description?: string;
}

const {
  title = "个人博客 | Notes & Fieldwork",
  description = "一个记录思考、项目和生活观察的个人博客。",
} = Astro.props;

const canonical = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;700;900&family=Nunito+Sans:wght@400;600;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <a class="skip-link" href="#main">跳到正文</a>
    <header class="site-header">
      <nav class="nav" aria-label="主导航">
        <a class="brand" href={Astro.site ? new URL(Astro.base, Astro.site).pathname : Astro.base} aria-label="回到首页">
          <span class="brand-mark">N</span>
          <span>Notes & Fieldwork</span>
        </a>
        <div class="nav-links">
          <a href={`${Astro.base}#posts`}>文章</a>
          <a href={`${Astro.base}archive/`}>归档</a>
          <a href={`${Astro.base}#about`}>关于</a>
          <a href={`${Astro.base}#contact`}>联系</a>
        </div>
      </nav>
    </header>

    <main id="main">
      <slot />
    </main>

    <footer class="site-footer">
      <p>© 2026 Notes & Fieldwork. Built with Astro and GitHub Pages.</p>
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Create `src/layouts/PostLayout.astro`**

Create `src/layouts/PostLayout.astro` with this exact content:

```astro
---
import BaseLayout from "./BaseLayout.astro";

interface Props {
  title: string;
  description: string;
  pubDate: Date;
  category: string;
  tags: string[];
}

const { title, description, pubDate, category, tags } = Astro.props;
const formattedDate = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(pubDate);
---

<BaseLayout title={`${title} | Notes & Fieldwork`} description={description}>
  <article class="post-page">
    <a class="back-link" href={`${Astro.base}`}>← 返回首页</a>
    <p class="post-meta">{formattedDate} · {category}</p>
    <h1>{title}</h1>
    <p class="post-description">{description}</p>
    <div class="tag-list" aria-label="文章标签">
      {tags.map((tag) => <span>{tag}</span>)}
    </div>
    <div class="article-content">
      <slot />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Create `src/styles/global.css`**

Copy the current root `styles.css` content into `src/styles/global.css`, then make these exact additions at the end:

```css
.post-description {
  max-width: 680px;
  color: var(--muted);
  font-size: 1.18rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin: 1.2rem 0 2rem;
}

.tag-list span {
  padding: 0.35rem 0.7rem;
  border: 1px solid rgba(24, 33, 31, 0.16);
  border-radius: 999px;
  color: var(--pine);
  background: rgba(255, 250, 240, 0.72);
  font-weight: 900;
}

.article-content {
  margin-top: 2rem;
}

.archive-list {
  display: grid;
  gap: 1rem;
  margin-top: 2rem;
}

.archive-item {
  display: grid;
  grid-template-columns: 8rem minmax(0, 1fr);
  gap: 1.2rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--line);
}

.archive-item a {
  font-family: "Noto Serif SC", serif;
  font-size: 1.35rem;
  font-weight: 900;
  text-decoration: none;
}

@media (max-width: 640px) {
  .archive-item {
    grid-template-columns: 1fr;
    gap: 0.3rem;
  }
}
```

- [ ] **Step 4: Create `src/scripts/filters.js`**

Copy the current root `script.js` content into `src/scripts/filters.js`.

- [ ] **Step 5: Commit layouts and styles**

Run:

```powershell
git add src/layouts src/styles src/scripts
git commit -m "feat: add astro layouts and styles"
```

Expected: commit succeeds.

## Task 4: Build Dynamic Home and Post Pages

**Files:**
- Create: `src/pages/index.astro`
- Create: `src/pages/posts/[slug].astro`

- [ ] **Step 1: Create `src/pages/posts/[slug].astro`**

Create `src/pages/posts/[slug].astro` with this exact content:

```astro
---
import { getCollection } from "astro:content";
import PostLayout from "../../layouts/PostLayout.astro";

export async function getStaticPaths() {
  const posts = await getCollection("posts");

  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<PostLayout
  title={post.data.title}
  description={post.data.description}
  pubDate={post.data.pubDate}
  category={post.data.category}
  tags={post.data.tags}
>
  <Content />
</PostLayout>
```

- [ ] **Step 2: Create `src/pages/index.astro`**

Create `src/pages/index.astro` with this exact content:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../layouts/BaseLayout.astro";

const posts = (await getCollection("posts")).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
const featured = posts.find((post) => post.data.featured) ?? posts[0];
const formatDate = (date) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
---

<BaseLayout>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-media" role="img" aria-label="铺开的笔记、咖啡和晨光中的书桌"></div>
    <div class="hero-content">
      <p class="eyebrow">Personal blog / 个人记录</p>
      <h1 id="hero-title">把想法写清楚，把日子过具体。</h1>
      <p class="hero-copy">这里会放我的项目复盘、学习笔记、阅读摘录和一些生活现场。先从小而稳定的更新开始，让每篇文章都留下可复用的线索。</p>
      <div class="hero-actions">
        <a class="button primary" href="#posts">阅读文章</a>
        <a class="button ghost" href="#about">认识我</a>
      </div>
    </div>
  </section>

  <section class="featured" aria-labelledby="featured-title">
    <div class="section-heading">
      <p class="eyebrow">Featured</p>
      <h2 id="featured-title">最近想写明白的事</h2>
    </div>
    <article class="feature-story">
      <div>
        <p class="post-meta">{formatDate(featured.data.pubDate)} · {featured.data.category}</p>
        <h3><a href={`${Astro.base}posts/${featured.slug}/`}>{featured.data.title}</a></h3>
      </div>
      <p>{featured.data.description}</p>
    </article>
  </section>

  <section id="posts" class="posts-section" aria-labelledby="posts-title">
    <div class="section-heading">
      <p class="eyebrow">Journal</p>
      <h2 id="posts-title">文章</h2>
    </div>

    <div class="filter-bar" role="list" aria-label="文章筛选">
      <button class="filter active" data-filter="all" type="button">全部</button>
      <button class="filter" data-filter="项目" type="button">项目</button>
      <button class="filter" data-filter="学习" type="button">学习</button>
      <button class="filter" data-filter="生活" type="button">生活</button>
    </div>

    <div class="post-grid" id="postGrid">
      {posts.map((post) => (
        <article class="post-card" data-topic={post.data.category}>
          <p class="post-meta">{formatDate(post.data.pubDate)} · {post.data.category}</p>
          <h3><a href={`${Astro.base}posts/${post.slug}/`}>{post.data.title}</a></h3>
          <p>{post.data.description}</p>
          <a class="read-more" href={`${Astro.base}posts/${post.slug}/`}>阅读全文</a>
        </article>
      ))}
    </div>
  </section>

  <section id="about" class="about-section" aria-labelledby="about-title">
    <div class="about-copy">
      <p class="eyebrow">About</p>
      <h2 id="about-title">你好，我在这里记录正在形成的想法。</h2>
      <p>你可以把这一段改成自己的介绍：你是谁、正在做什么、关心哪些问题，以及希望通过这个博客和谁产生连接。</p>
    </div>
    <div class="about-panel" aria-label="博客主题">
      <span>项目复盘</span>
      <span>技术学习</span>
      <span>阅读笔记</span>
      <span>生活观察</span>
    </div>
  </section>

  <section id="contact" class="contact-section" aria-labelledby="contact-title">
    <p class="eyebrow">Contact</p>
    <h2 id="contact-title">想交流的话，可以从这里开始。</h2>
    <p>把下面的链接替换成你的邮箱、GitHub、微博、公众号或其他主页。</p>
    <div class="contact-links">
      <a href="mailto:hello@example.com">Email</a>
      <a href="https://github.com/" rel="noreferrer">GitHub</a>
      <a href="https://www.linkedin.com/" rel="noreferrer">LinkedIn</a>
    </div>
  </section>

  <script src={Astro.resolve("../scripts/filters.js")}></script>
</BaseLayout>
```

- [ ] **Step 3: Run build and fix only compile errors**

Run:

```powershell
npm.cmd run build
```

Expected: command exits `0` and creates `dist/index.html` plus generated post pages.

If Astro rejects `Astro.resolve`, replace the script line in `src/pages/index.astro` with:

```astro
<script is:inline>
  const filters = document.querySelectorAll(".filter");
  const posts = document.querySelectorAll(".post-card");

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const topic = filter.dataset.filter;

      filters.forEach((item) => item.classList.remove("active"));
      filter.classList.add("active");

      posts.forEach((post) => {
        const shouldShow = topic === "all" || post.dataset.topic === topic;
        post.hidden = !shouldShow;
      });
    });
  });
</script>
```

- [ ] **Step 4: Commit dynamic pages**

Run:

```powershell
git add src/pages
git commit -m "feat: render blog pages from markdown"
```

Expected: commit succeeds.

## Task 5: Add Archive, RSS, and Sitemap Support

**Files:**
- Create: `src/pages/archive.astro`
- Create: `src/pages/rss.xml.js`

- [ ] **Step 1: Create `src/pages/archive.astro`**

Create `src/pages/archive.astro` with this exact content:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../layouts/BaseLayout.astro";

const posts = (await getCollection("posts")).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
const formatDate = (date) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
---

<BaseLayout title="文章归档 | Notes & Fieldwork" description="Notes & Fieldwork 的全部文章归档。">
  <section class="post-page">
    <a class="back-link" href={`${Astro.base}`}>← 返回首页</a>
    <p class="eyebrow">Archive</p>
    <h1>文章归档</h1>
    <div class="archive-list">
      {posts.map((post) => (
        <article class="archive-item">
          <time datetime={post.data.pubDate.toISOString()}>{formatDate(post.data.pubDate)}</time>
          <div>
            <a href={`${Astro.base}posts/${post.slug}/`}>{post.data.title}</a>
            <p>{post.data.description}</p>
          </div>
        </article>
      ))}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/rss.xml.js`**

Create `src/pages/rss.xml.js` with this exact content:

```js
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = (await getCollection("posts")).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: "Notes & Fieldwork",
    description: "一个记录思考、项目和生活观察的个人博客。",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/posts/${post.slug}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
  });
}
```

- [ ] **Step 3: Run build and verify generated files**

Run:

```powershell
npm.cmd run build
```

Expected: command exits `0`, `dist/archive/index.html` exists, `dist/rss.xml` exists, and `dist/sitemap-index.xml` or `dist/sitemap-0.xml` exists.

- [ ] **Step 4: Commit archive and feeds**

Run:

```powershell
git add src/pages/archive.astro src/pages/rss.xml.js
git commit -m "feat: add archive rss and sitemap"
```

Expected: commit succeeds.

## Task 6: Update GitHub Pages Workflow for Astro Build

**Files:**
- Modify: `.github/workflows/pages.yml`

- [ ] **Step 1: Replace `.github/workflows/pages.yml`**

Replace `.github/workflows/pages.yml` with this exact content:

```yaml
name: Deploy Astro site to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5
        with:
          enablement: true

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Run local build before committing workflow**

Run:

```powershell
npm.cmd run build
```

Expected: command exits `0`.

- [ ] **Step 3: Commit workflow**

Run:

```powershell
git add .github/workflows/pages.yml
git commit -m "ci: build astro site for github pages"
```

Expected: commit succeeds.

## Task 7: Remove Legacy Static Files

**Files:**
- Delete: `index.html`
- Delete: `styles.css`
- Delete: `script.js`
- Delete: `posts/build-notes.html`
- Delete: `posts/hello-world.html`
- Delete: `posts/reading-log.html`
- Keep: `.nojekyll`

- [ ] **Step 1: Delete legacy files**

Run:

```powershell
git rm index.html styles.css script.js posts/build-notes.html posts/hello-world.html posts/reading-log.html
```

Expected: six files are staged for deletion.

- [ ] **Step 2: Remove empty `posts/` directory if Git leaves it empty**

Run:

```powershell
Get-ChildItem -Force posts
```

Expected: no tracked files remain in `posts/`. Git does not track empty directories, so no separate commit action is needed for the directory.

- [ ] **Step 3: Run build after cleanup**

Run:

```powershell
npm.cmd run build
```

Expected: command exits `0`, proving the Astro site no longer depends on root legacy files.

- [ ] **Step 4: Commit cleanup**

Run:

```powershell
git add -u
git commit -m "chore: remove legacy static html"
```

Expected: commit succeeds.

## Task 8: Update Documentation and Publishing Workflow

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md`**

Replace `README.md` with this exact content:

````markdown
# Notes & Fieldwork

一个使用 Astro、Markdown 和 GitHub Pages 构建的个人博客。

## 本地开发

安装依赖：

```powershell
npm.cmd install
````

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
```

- [ ] **Step 2: Run build**

Run:

```powershell
npm.cmd run build
```

Expected: command exits `0`.

- [ ] **Step 3: Commit documentation**

Run:

```powershell
git add README.md
git commit -m "docs: document astro blogging workflow"
```

Expected: commit succeeds.

## Task 9: Verify Locally and Push

**Files:**
- No code changes expected.

- [ ] **Step 1: Run full build verification**

Run:

```powershell
npm.cmd run build
```

Expected: command exits `0`.

- [ ] **Step 2: Start preview server**

Run:

```powershell
npm.cmd run preview
```

Expected: Astro prints a local preview URL such as `http://127.0.0.1:4321/GitHubWeb/`.

- [ ] **Step 3: Browser-check key routes**

Open these routes in the in-app browser:

```text
http://127.0.0.1:4321/GitHubWeb/
http://127.0.0.1:4321/GitHubWeb/posts/build-notes/
http://127.0.0.1:4321/GitHubWeb/archive/
http://127.0.0.1:4321/GitHubWeb/rss.xml
```

Expected:
- Homepage shows the hero, featured post, and three post cards.
- Category filter still hides and shows post cards.
- Article detail page renders Markdown content.
- Archive page lists three articles newest first.
- RSS route returns XML.

- [ ] **Step 4: Check final Git status**

Run:

```powershell
git status --short
```

Expected: no output.

- [ ] **Step 5: Push to GitHub**

Run:

```powershell
git push origin main
```

Expected: push succeeds and GitHub Actions starts a new `Deploy Astro site to GitHub Pages` run.

- [ ] **Step 6: Verify deployed site**

After Actions succeeds, open:

```text
https://liyolo.github.io/GitHubWeb/
```

Expected:
- Homepage loads without broken CSS.
- Post links use `/GitHubWeb/posts/.../`.
- Archive loads at `/GitHubWeb/archive/`.
- RSS loads at `/GitHubWeb/rss.xml`.

## Self-Review

- Spec coverage: The plan covers Markdown writing, dynamic post pages, homepage post listing, archive, RSS, sitemap, Astro build, GitHub Pages deployment, legacy cleanup, and documentation.
- Placeholder scan: No unresolved placeholder markers or vague implementation-only instructions remain.
- Type consistency: Content collection fields are consistently named `title`, `description`, `pubDate`, `category`, `tags`, and `featured` across layouts, pages, RSS, and README examples.
