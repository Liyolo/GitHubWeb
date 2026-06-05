# Blog Search Navigation Authoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add site search, previous/next article navigation, lightweight visit counters, and a one-command Markdown post generator to the Astro blog.

**Architecture:** Keep the blog fully static and GitHub Pages-friendly. Generate a small client-side search index from published posts in `index.astro`, enhance the existing article filter script to combine category and search text, compute previous/next post links at build time, add lightweight PV counters through a third-party compatible script that is disabled on localhost, and add a Node script that creates Markdown files with valid frontmatter. No custom backend, database, or search service is required.

**Tech Stack:** Astro content collections, TypeScript helpers, vanilla browser JavaScript, Node.js ESM script, CSS, npm scripts.

---

## File Structure

- Modify: `src/lib/posts.ts` to add a reusable previous/next helper.
- Modify: `src/pages/posts/[slug].astro` to pass previous/next posts into the layout.
- Modify: `src/layouts/PostLayout.astro` to render previous/next navigation.
- Create: `src/components/VisitCounter.astro` for reusable site/page counter markup.
- Create: `src/scripts/visit-counter.js` to load the counter provider only on production-like hosts.
- Copy: `public/scripts/visit-counter.js` so GitHub Pages can serve the counter loader.
- Modify: `src/layouts/BaseLayout.astro` to render site visit count in the footer and load the counter script.
- Modify: `src/pages/index.astro` to render search UI and a JSON search index.
- Create: `src/scripts/post-search.js` for combined category and text filtering.
- Modify: `src/styles/global.css` for search UI, empty state, and previous/next cards.
- Create: `scripts/new-post.mjs` for one-command article creation.
- Modify: `package.json` to add `new-post` script.
- Modify: `README.md` to document search, previous/next behavior, and article creation.

## Task 1: Shared Post Navigation Helper

**Files:**
- Modify: `src/lib/posts.ts`

- [ ] **Step 1: Add previous/next helper to `src/lib/posts.ts`**

Append this function after `getPublishedPosts`:

```ts
export const getAdjacentPosts = (posts: BlogPost[], slug: string) => {
  const publishedPosts = getPublishedPosts(posts);
  const currentIndex = publishedPosts.findIndex((post) => post.slug === slug);

  return {
    previousPost: currentIndex > 0 ? publishedPosts[currentIndex - 1] : undefined,
    nextPost:
      currentIndex >= 0 && currentIndex < publishedPosts.length - 1
        ? publishedPosts[currentIndex + 1]
        : undefined,
  };
};
```

- [ ] **Step 2: Run build**

Run:

```powershell
npm.cmd run build
```

Expected: command exits `0`.

- [ ] **Step 3: Commit helper**

Run:

```powershell
git add src/lib/posts.ts
git commit -m "feat: add adjacent post helper"
```

Expected: commit succeeds.

## Task 2: Site Search on Homepage

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/scripts/post-search.js`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Update imports and create search index in `src/pages/index.astro`**

Change the import from `src/lib/posts` to include `BlogPost`:

```astro
import { categorySlug, getPublishedPosts, getTags, tagSlug, type BlogPost } from "../lib/posts";
```

Add this block after `const tags = getTags(posts).slice(0, 12);`:

```astro
const normalizeSearchText = (value: string) => value.toLowerCase();
const searchIndex = posts.map((post: BlogPost) => ({
  slug: post.slug,
  title: post.data.title,
  description: post.data.description,
  category: post.data.category,
  tags: post.data.tags,
  url: withBase(`posts/${post.slug}/`),
  text: normalizeSearchText(
    [post.data.title, post.data.description, post.data.category, ...post.data.tags].join(" ")
  ),
}));
```

- [ ] **Step 2: Add search UI before `.filter-bar` in `src/pages/index.astro`**

Insert this block directly before `<div class="filter-bar" role="list" ...>`:

```astro
    <div class="post-search" role="search">
      <label for="postSearch">搜索文章</label>
      <input
        id="postSearch"
        name="postSearch"
        type="search"
        placeholder="输入标题、摘要、分类或标签"
        autocomplete="off"
      />
      <p class="search-help">可以搜索标题、摘要、分类和标签。</p>
    </div>
```

- [ ] **Step 3: Add search result count and empty state after `.filter-bar`**

Insert this block directly after the filter bar closing `</div>`:

```astro
    <p class="search-status" aria-live="polite">
      显示 <span data-search-count>{posts.length}</span> 篇文章
    </p>
```

Insert this block directly after the post grid closing `</div>`:

```astro
    <p class="empty-state search-empty" hidden>没有找到匹配的文章，换个关键词试试。</p>
```

- [ ] **Step 4: Add search data and external script at the bottom of `src/pages/index.astro`**

Replace the existing inline filter `<script is:inline>...</script>` block with:

```astro
  <script type="application/json" id="post-search-data" set:html={JSON.stringify(searchIndex)} />
  <script src={withBase("scripts/post-search.js")} defer></script>
```

- [ ] **Step 5: Create `src/scripts/post-search.js`**

Create the file with this exact content:

```js
const initPostSearch = () => {
  const filterBar = document.querySelector(".filter-bar");
  const filters = [...document.querySelectorAll(".filter")];
  const searchInput = document.querySelector("#postSearch");
  const posts = [...document.querySelectorAll(".post-card")];
  const count = document.querySelector("[data-search-count]");
  const empty = document.querySelector(".search-empty");
  const searchData = document.querySelector("#post-search-data");

  if (!filterBar || filters.length === 0 || !searchInput || posts.length === 0 || !searchData) {
    return;
  }

  const index = new Map(
    JSON.parse(searchData.textContent || "[]").map((entry) => [entry.slug, entry])
  );

  const getActiveFilter = () =>
    filters.find((filter) => filter.classList.contains("active"))?.dataset.filter || "all";

  const updatePosts = () => {
    const activeFilter = getActiveFilter();
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    posts.forEach((post) => {
      const entry = index.get(post.dataset.slug);
      const matchesCategory = activeFilter === "all" || post.dataset.topic === activeFilter;
      const matchesSearch = !query || entry?.text.includes(query);
      const shouldShow = matchesCategory && matchesSearch;

      post.hidden = !shouldShow;
      if (shouldShow) visibleCount += 1;
    });

    if (count) count.textContent = String(visibleCount);
    if (empty) empty.hidden = visibleCount > 0;
  };

  filterBar.addEventListener("click", (event) => {
    const filter = event.target.closest(".filter");
    if (!filter) return;

    filters.forEach((item) => {
      const isActive = item === filter;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    updatePosts();
  });

  searchInput.addEventListener("input", updatePosts);
  updatePosts();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPostSearch, { once: true });
} else {
  initPostSearch();
}
```

- [ ] **Step 6: Add slug data to post cards in `src/pages/index.astro`**

Change:

```astro
<article class="post-card" data-topic={post.data.category}>
```

to:

```astro
<article class="post-card" data-topic={post.data.category} data-slug={post.slug}>
```

- [ ] **Step 7: Copy search script during build**

Because `src/scripts/post-search.js` is not bundled by Astro when referenced as a static path, copy it to `public/scripts/post-search.js`:

```powershell
New-Item -ItemType Directory -Force public\scripts
Copy-Item -LiteralPath src\scripts\post-search.js -Destination public\scripts\post-search.js -Force
```

Expected: `public/scripts/post-search.js` exists and matches `src/scripts/post-search.js`.

- [ ] **Step 8: Add search CSS to `src/styles/global.css`**

Append this CSS near the existing filter styles:

```css
.post-search {
  display: grid;
  gap: 0.45rem;
  max-width: 620px;
  margin-bottom: 1.2rem;
}

.post-search label {
  color: var(--pine);
  font-weight: 900;
}

.post-search input {
  width: 100%;
  min-height: 48px;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(24, 33, 31, 0.18);
  border-radius: 999px;
  color: var(--ink);
  background: rgba(255, 250, 240, 0.82);
  font: inherit;
}

.post-search input:focus {
  outline: 3px solid rgba(139, 184, 200, 0.45);
  outline-offset: 2px;
}

.search-help,
.search-status {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
}

.search-status {
  margin-bottom: 1rem;
  font-weight: 800;
}

.search-empty {
  margin-top: 1.5rem;
}
```

- [ ] **Step 9: Run build and verify search assets**

Run:

```powershell
npm.cmd run build
Test-Path dist\scripts\post-search.js
Select-String -Path dist\index.html -Pattern 'postSearch|post-search-data|data-search-count'
Select-String -Path dist\scripts\post-search.js -Pattern 'initPostSearch|matchesCategory|matchesSearch'
```

Expected: build exits `0`, `Test-Path` prints `True`, and both `Select-String` commands print matches.

- [ ] **Step 10: Commit search feature**

Run:

```powershell
git add src/pages/index.astro src/scripts/post-search.js public/scripts/post-search.js src/styles/global.css
git commit -m "feat: add homepage post search"
```

Expected: commit succeeds.

## Task 3: Previous and Next Article Navigation

**Files:**
- Modify: `src/pages/posts/[slug].astro`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Pass adjacent posts from `src/pages/posts/[slug].astro`**

Change the import:

```astro
import { getAdjacentPosts, getPublishedPosts } from "../../lib/posts";
```

Replace `getStaticPaths()` with:

```astro
export async function getStaticPaths() {
  const allPosts = await getCollection("posts");
  const posts = getPublishedPosts(allPosts);

  return posts.map((post) => {
    const { previousPost, nextPost } = getAdjacentPosts(allPosts, post.slug);

    return {
      params: { slug: post.slug },
      props: { post, previousPost, nextPost },
    };
  });
}
```

Change:

```astro
const { post } = Astro.props;
```

to:

```astro
const { post, previousPost, nextPost } = Astro.props;
```

Pass these props into `<PostLayout>`:

```astro
  previousPost={previousPost}
  nextPost={nextPost}
```

- [ ] **Step 2: Update `src/layouts/PostLayout.astro` props**

Add this import:

```astro
import type { BlogPost } from "../lib/posts";
```

Extend the `Props` interface:

```ts
  previousPost?: BlogPost;
  nextPost?: BlogPost;
```

Change destructuring to:

```ts
const {
  title,
  description,
  slug,
  pubDate,
  category,
  tags,
  headings,
  image,
  previousPost,
  nextPost,
} = Astro.props;
```

- [ ] **Step 3: Render previous/next navigation in `src/layouts/PostLayout.astro`**

Insert this block after the `.article-content` closing `</div>` and before `</article>`:

```astro
    {(previousPost || nextPost) && (
      <nav class="post-navigation" aria-label="上一篇和下一篇文章">
        {previousPost ? (
          <a class="post-navigation-card" href={withBase(`posts/${previousPost.slug}/`)}>
            <span>上一篇</span>
            <strong>{previousPost.data.title}</strong>
          </a>
        ) : (
          <span class="post-navigation-card is-disabled">
            <span>上一篇</span>
            <strong>已经是最新文章</strong>
          </span>
        )}
        {nextPost ? (
          <a class="post-navigation-card" href={withBase(`posts/${nextPost.slug}/`)}>
            <span>下一篇</span>
            <strong>{nextPost.data.title}</strong>
          </a>
        ) : (
          <span class="post-navigation-card is-disabled">
            <span>下一篇</span>
            <strong>已经是最后一篇</strong>
          </span>
        )}
      </nav>
    )}
```

- [ ] **Step 4: Add previous/next CSS to `src/styles/global.css`**

Append:

```css
.post-navigation {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--line);
}

.post-navigation-card {
  display: grid;
  gap: 0.35rem;
  min-height: 120px;
  padding: 1rem;
  border: 1px solid rgba(24, 33, 31, 0.14);
  color: var(--ink);
  background: rgba(255, 250, 240, 0.76);
  text-decoration: none;
}

.post-navigation-card span {
  color: var(--coral);
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.post-navigation-card strong {
  font-family: "Noto Serif SC", serif;
  font-size: 1.18rem;
  line-height: 1.35;
}

.post-navigation-card:not(.is-disabled):hover {
  border-color: var(--pine);
  box-shadow: var(--shadow);
}

.post-navigation-card.is-disabled {
  color: var(--muted);
  background: rgba(255, 250, 240, 0.42);
}

@media (max-width: 640px) {
  .post-navigation {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Run build and verify navigation output**

Run:

```powershell
npm.cmd run build
Select-String -Path dist\posts\build-notes\index.html -Pattern 'post-navigation|上一篇|下一篇'
```

Expected: build exits `0` and `Select-String` prints matches.

- [ ] **Step 6: Commit previous/next navigation**

Run:

```powershell
git add src/pages/posts/[slug].astro src/layouts/PostLayout.astro src/styles/global.css src/lib/posts.ts
git commit -m "feat: add adjacent article navigation"
```

Expected: commit succeeds.

## Task 4: Lightweight Visit Counters

**Files:**
- Create: `src/components/VisitCounter.astro`
- Create: `src/scripts/visit-counter.js`
- Copy: `public/scripts/visit-counter.js`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create `src/components/VisitCounter.astro`**

Create this file:

```astro
---
interface Props {
  type: "site" | "page";
}

const { type } = Astro.props;
---

{type === "site" ? (
  <span class="visit-counter site-visit-counter" aria-label="本站访问量">
    <span>本站访问</span>
    <strong id="busuanzi_value_site_pv">--</strong>
    <span>次</span>
  </span>
) : (
  <span class="visit-counter article-visit-counter" aria-label="本文阅读量">
    <svg class="visit-counter-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5.2c4.5 0 8.1 3.1 10 6.8-1.9 3.7-5.5 6.8-10 6.8S3.9 15.7 2 12c1.9-3.7 5.5-6.8 10-6.8Zm0 2C8.7 7.2 5.9 9.1 4.3 12c1.6 2.9 4.4 4.8 7.7 4.8s6.1-1.9 7.7-4.8c-1.6-2.9-4.4-4.8-7.7-4.8Zm0 2.1a2.7 2.7 0 1 1 0 5.4 2.7 2.7 0 0 1 0-5.4Z" fill="currentColor" />
    </svg>
    <span id="busuanzi_value_page_pv">--</span>
  </span>
)}
```

- [ ] **Step 2: Create `src/scripts/visit-counter.js`**

Create this file:

```js
const initVisitCounter = () => {
  const hasCounter = document.querySelector("#busuanzi_value_site_pv, #busuanzi_value_page_pv");
  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  if (!hasCounter || isLocalHost || document.querySelector("[data-visit-counter-script]")) {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://cn.vercount.one/js";
  script.dataset.visitCounterScript = "true";

  script.addEventListener("error", () => {
    document.querySelectorAll("#busuanzi_value_site_pv, #busuanzi_value_page_pv").forEach((counter) => {
      counter.textContent = "暂不可用";
    });
  });

  document.head.append(script);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVisitCounter, { once: true });
} else {
  initVisitCounter();
}
```

- [ ] **Step 3: Copy visit counter script to `public/scripts/visit-counter.js`**

Run:

```powershell
New-Item -ItemType Directory -Force public\scripts
Copy-Item -LiteralPath src\scripts\visit-counter.js -Destination public\scripts\visit-counter.js -Force
```

Expected: `public/scripts/visit-counter.js` exists and matches `src/scripts/visit-counter.js`.

- [ ] **Step 4: Add site counter to `src/layouts/BaseLayout.astro`**

Add this import below the global CSS import:

```astro
import VisitCounter from "../components/VisitCounter.astro";
```

Replace the footer with:

```astro
    <footer class="site-footer">
      <p>漏 2026 Notes & Fieldwork. Built with Astro and GitHub Pages.</p>
      <VisitCounter type="site" />
    </footer>
    <script src={withBase("scripts/visit-counter.js")} defer></script>
```

Expected: the site counter appears in the footer on every page, and the loader script is included once per page.

- [ ] **Step 5: Add eye-icon article counter to `src/layouts/PostLayout.astro`**

Add this import:

```astro
import VisitCounter from "../components/VisitCounter.astro";
```

Replace:

```astro
    <p class="post-meta">{formattedDate} 路 {category}</p>
```

with:

```astro
    <p class="post-meta article-meta">
      <span>{formattedDate} 路 {category}</span>
      <VisitCounter type="page" />
    </p>
```

Expected: each article title area displays an eye icon plus the page PV number. The visible label does not say `本文阅读`; the accessible label remains `本文阅读量`.

- [ ] **Step 6: Add counter CSS to `src/styles/global.css`**

Append:

```css
.visit-counter,
.article-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.visit-counter {
  color: var(--muted);
  font-size: 0.92rem;
  font-weight: 800;
}

.visit-counter strong {
  color: var(--pine);
}

.site-visit-counter {
  justify-content: center;
  margin-top: 0.4rem;
}

.article-meta {
  flex-wrap: wrap;
}

.article-visit-counter {
  color: var(--pine);
}

.visit-counter-icon {
  width: 1.05em;
  height: 1.05em;
  flex: 0 0 auto;
}
```

- [ ] **Step 7: Run build and verify counter output**

Run:

```powershell
npm.cmd run build
Test-Path dist\scripts\visit-counter.js
Select-String -Path dist\index.html -Pattern 'busuanzi_value_site_pv|visit-counter.js'
Select-String -Path dist\posts\build-notes\index.html -Pattern 'busuanzi_value_page_pv|article-visit-counter|visit-counter-icon'
Select-String -Path dist\scripts\visit-counter.js -Pattern 'cn.vercount.one|localhost|busuanzi_value_page_pv'
```

Expected: build exits `0`, `Test-Path` prints `True`, and every `Select-String` command prints matches.

- [ ] **Step 8: Commit visit counters**

Run:

```powershell
git add src/components/VisitCounter.astro src/scripts/visit-counter.js public/scripts/visit-counter.js src/layouts/BaseLayout.astro src/layouts/PostLayout.astro src/styles/global.css
git commit -m "feat: add lightweight visit counters"
```

Expected: commit succeeds.

## Task 5: One-Command Article Generator

**Files:**
- Create: `scripts/new-post.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create `scripts/new-post.mjs`**

Create this file:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const [, , rawTitle, rawCategory = "学习", ...rawTags] = process.argv;

const categories = new Set(["项目", "学习", "生活"]);

const slugify = (value) => {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `post-${new Date().toISOString().slice(0, 10)}`;
};

const quote = (value) => `"${String(value).replaceAll('"', '\\"')}"`;

if (!rawTitle) {
  console.error("用法: npm run new-post -- \"文章标题\" [项目|学习|生活] [标签1] [标签2]");
  process.exit(1);
}

if (!categories.has(rawCategory)) {
  console.error(`分类必须是：${[...categories].join("、")}`);
  process.exit(1);
}

const slug = slugify(rawTitle);
const postsDir = path.join(process.cwd(), "src", "content", "posts");
const filePath = path.join(postsDir, `${slug}.md`);

if (existsSync(filePath)) {
  console.error(`文章已存在：${filePath}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const tags = rawTags.length > 0 ? rawTags : ["写作"];
const content = `---
title: ${quote(rawTitle)}
description: "用一句话概括这篇文章。"
pubDate: ${today}
category: ${quote(rawCategory)}
tags: [${tags.map(quote).join(", ")}]
featured: false
draft: true
---

## 开始写作

在这里写下第一段。
`;

await mkdir(postsDir, { recursive: true });
await writeFile(filePath, content, "utf8");

console.log(`已创建文章：${filePath}`);
console.log("默认 draft: true，写完后改成 draft: false 或删除这一行再发布。");
```

- [ ] **Step 2: Add npm script to `package.json`**

Change the `scripts` object to include `new-post`:

```json
  "scripts": {
    "dev": "astro dev --host 127.0.0.1",
    "build": "astro build",
    "preview": "astro preview --host 127.0.0.1",
    "new-post": "node scripts/new-post.mjs"
  },
```

- [ ] **Step 3: Test missing title failure**

Run:

```powershell
npm.cmd run new-post
```

Expected: command exits non-zero and prints:

```text
用法: npm run new-post -- "文章标题" [项目|学习|生活] [标签1] [标签2]
```

- [ ] **Step 4: Test successful post creation**

Run:

```powershell
npm.cmd run new-post -- "测试文章生成器" 学习 Astro 工具
Test-Path src\content\posts\post-2026-06-06.md
```

Expected: the command creates a Markdown file. Because the title is Chinese and cannot produce an ASCII slug, the fallback filename is `post-2026-06-06.md` on June 6, 2026.

- [ ] **Step 5: Verify generated post is draft-only**

Run:

```powershell
npm.cmd run build
Test-Path dist\posts\post-2026-06-06\index.html
```

Expected: build exits `0` and `Test-Path` prints `False` because the generated article has `draft: true`.

- [ ] **Step 6: Remove generated test post**

Run:

```powershell
Remove-Item -LiteralPath src\content\posts\post-2026-06-06.md
```

Expected: file is removed. Do not commit the test post.

- [ ] **Step 7: Commit article generator**

Run:

```powershell
git add scripts/new-post.mjs package.json
git commit -m "feat: add new post generator"
```

Expected: commit succeeds.

## Task 6: Documentation and Final Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document the new workflow in `README.md`**

Append:

```markdown
## 搜索、上一篇/下一篇、访问统计和新建文章

首页文章区支持按标题、摘要、分类和标签搜索。搜索框会和分类筛选一起生效，例如先点 `学习`，再输入 `Astro`，只会显示学习分类中匹配 Astro 的文章。

每篇文章底部会显示上一篇和下一篇，顺序按发布日期从新到旧排列。草稿文章不会出现在上一篇/下一篇中。

网站页脚会显示本站访问量。每篇文章标题下方会显示一个眼睛图标和当前文章阅读量。统计脚本只会在非 `localhost` / `127.0.0.1` 环境加载，本地预览不会计入访问量。

可以用命令创建新文章：

```powershell
npm run new-post -- "我的新文章标题" 学习 Astro 写作
```

命令会在 `src/content/posts/` 下创建 Markdown 文件，并默认设置：

```yaml
draft: true
```

写完后，把 `draft` 改成 `false` 或删除这一行，再提交推送即可发布。
```

- [ ] **Step 2: Run full build**

Run:

```powershell
npm.cmd run build
```

Expected: command exits `0`.

- [ ] **Step 3: Verify generated output**

Run:

```powershell
Test-Path dist\index.html
Test-Path dist\scripts\post-search.js
Test-Path dist\scripts\visit-counter.js
Select-String -Path dist\index.html -Pattern 'postSearch|post-search-data|data-search-count'
Select-String -Path dist\posts\build-notes\index.html -Pattern 'post-navigation|上一篇|下一篇'
Select-String -Path dist\posts\build-notes\index.html -Pattern 'busuanzi_value_page_pv|visit-counter-icon'
```

Expected: `Test-Path` commands print `True`, and all `Select-String` commands print matches.

- [ ] **Step 4: Verify article generator one more time**

Run:

```powershell
npm.cmd run new-post -- "最终验证文章" 项目 验证
npm.cmd run build
Test-Path dist\posts\post-2026-06-06\index.html
Remove-Item -LiteralPath src\content\posts\post-2026-06-06.md
```

Expected: build exits `0`, `Test-Path` prints `False`, and the generated test post is removed before commit.

- [ ] **Step 5: Commit documentation**

Run:

```powershell
git add README.md
git commit -m "docs: document search navigation and post creation"
```

Expected: commit succeeds.

- [ ] **Step 6: Push to GitHub**

Run:

```powershell
git push origin main
```

Expected: push succeeds and GitHub Actions starts a new Pages deployment.

## Self-Review

- Spec coverage: The plan covers site search, previous/next navigation, lightweight site/article visit counters with an eye icon, one-command post creation, documentation, build verification, and push.
- Placeholder scan: The plan contains concrete file paths, commands, exact code blocks, and expected outputs. It does not contain unfinished placeholder tokens.
- Type consistency: `BlogPost`, `getPublishedPosts`, `getAdjacentPosts`, `previousPost`, `nextPost`, `data-slug`, and `post-search-data` are defined before use.
- Scope check: The plan keeps search and authoring fully static, and uses a lightweight third-party counter script instead of a custom analytics backend or database.
