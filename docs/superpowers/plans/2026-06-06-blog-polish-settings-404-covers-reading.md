# Blog Polish: Settings, 404, Covers, and Reading Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the Astro blog by centralizing site settings, adding a custom 404 page, rendering article cover images, and improving article reading experience.

**Architecture:** First expand `settings/settings.json` so site identity and homepage copy are configurable, then wire settings into layouts and generated pages. After the site foundation is configurable, add a static 404 page, cover image rendering from the existing `image` frontmatter field, and lightweight reading helpers/scripts that follow the current static GitHub Pages architecture.

**Tech Stack:** Astro 5, TypeScript, JSON settings, Markdown content collections, plain CSS, plain browser JavaScript, GitHub Pages.

---

## File Structure

- Modify: `settings/settings.json`  
  Stores site identity, homepage copy, About topics, footer text, and contact links.
- Modify: `src/lib/settings.ts`  
  Defines and validates the expanded Settings schema.
- Modify: `src/lib/site.ts`  
  Keeps fallback constants and shared URL/date helpers.
- Create: `src/lib/reading.ts`  
  Calculates estimated reading time from Markdown body text.
- Create: `src/components/ReadingProgress.astro`  
  Renders the fixed reading progress bar and back-to-top button.
- Create: `src/pages/404.astro`  
  Adds a custom GitHub Pages 404 page.
- Create: `src/scripts/reading-progress.js` and `public/scripts/reading-progress.js`  
  Sync scroll progress and back-to-top behavior.
- Create: `public/images/posts/build-notes.svg`  
  Adds a lightweight sample cover image for the featured article.
- Modify: `scripts/verify-public-scripts.mjs`  
  Adds the new browser script to the existing sync guard.
- Modify: `src/layouts/BaseLayout.astro`  
  Uses settings for default title, description, brand, and footer.
- Modify: `src/layouts/PostLayout.astro`  
  Uses settings for article metadata, renders cover image, reading time, and reading controls.
- Modify: `src/pages/index.astro`  
  Uses settings for homepage copy and renders cover images on featured/post cards.
- Modify: `src/pages/posts/[slug].astro`  
  Calculates and passes reading time.
- Modify: `src/pages/archive.astro`, `src/pages/categories/[category].astro`, `src/pages/tags/[tag].astro`, `src/pages/rss.xml.js`  
  Replace hard-coded site name/description values with settings.
- Modify: `src/content/posts/build-notes.md`  
  Adds a sample `image` frontmatter value.
- Modify: `src/styles/global.css`  
  Adds 404, cover image, reading progress, and back-to-top styles.
- Modify: `README.md`  
  Documents settings, cover images, 404, and reading experience.

---

## Task 1: Expand Site Settings

**Files:**
- Modify: `settings/settings.json`
- Modify: `src/lib/settings.ts`

- [ ] **Step 1: Replace `settings/settings.json`**

Use this structure and preserve the current Email/GitHub values:

```json
{
  "site": {
    "name": "Notes & Fieldwork",
    "title": "个人博客 | Notes & Fieldwork",
    "description": "一个记录思考、项目和生活观察的个人博客。",
    "author": "Notes & Fieldwork",
    "brandInitial": "N",
    "footerText": "© 2026 Notes & Fieldwork. Built with Astro and GitHub Pages."
  },
  "home": {
    "eyebrow": "Personal blog / 个人记录",
    "heroTitle": "把想法写清楚，把日子过具体。",
    "heroCopy": "这里会放我的项目复盘、学习笔记、阅读摘录和一些生活现场。先从小而稳定的更新开始，让每篇文章都留下可复用的线索。",
    "aboutEyebrow": "About",
    "aboutTitle": "你好，我在这里记录正在形成的想法。",
    "aboutCopy": "你可以把这一段改成自己的介绍：你是谁、正在做什么、关心哪些问题，以及希望通过这个博客和谁产生连接。",
    "topics": ["项目复盘", "技术学习", "阅读笔记", "生活观察"],
    "contactEyebrow": "Contact",
    "contactTitle": "想交流的话，可以从这里开始。"
  },
  "contactLinks": [
    {
      "label": "Email",
      "href": "mailto:hello@2418631620@qq.com"
    },
    {
      "label": "GitHub",
      "href": "https://github.com/Liyolo"
    }
  ]
}
```

- [ ] **Step 2: Replace `src/lib/settings.ts`**

Use:

```ts
import { readFile } from "node:fs/promises";
import path from "node:path";

export type ContactLink = {
  label: string;
  href: string;
};

export type SiteIdentitySettings = {
  name: string;
  title: string;
  description: string;
  author: string;
  brandInitial: string;
  footerText: string;
};

export type HomeSettings = {
  eyebrow: string;
  heroTitle: string;
  heroCopy: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutCopy: string;
  topics: string[];
  contactEyebrow: string;
  contactTitle: string;
};

export type SiteSettings = {
  site: SiteIdentitySettings;
  home: HomeSettings;
  contactLinks: ContactLink[];
};

const settingsPath = path.join(process.cwd(), "settings", "settings.json");

const readSettingsFile = async (filePath: string) => {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as SiteSettings;
};

const assertString = (value: unknown, fieldName: string) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`settings.${fieldName} must be a non-empty string.`);
  }
};

const validateSettings = (settings: SiteSettings) => {
  assertString(settings.site?.name, "site.name");
  assertString(settings.site?.title, "site.title");
  assertString(settings.site?.description, "site.description");
  assertString(settings.site?.author, "site.author");
  assertString(settings.site?.brandInitial, "site.brandInitial");
  assertString(settings.site?.footerText, "site.footerText");
  assertString(settings.home?.eyebrow, "home.eyebrow");
  assertString(settings.home?.heroTitle, "home.heroTitle");
  assertString(settings.home?.heroCopy, "home.heroCopy");
  assertString(settings.home?.aboutEyebrow, "home.aboutEyebrow");
  assertString(settings.home?.aboutTitle, "home.aboutTitle");
  assertString(settings.home?.aboutCopy, "home.aboutCopy");
  assertString(settings.home?.contactEyebrow, "home.contactEyebrow");
  assertString(settings.home?.contactTitle, "home.contactTitle");

  if (!Array.isArray(settings.home.topics)) {
    throw new Error("settings.home.topics must be an array.");
  }

  for (const topic of settings.home.topics) {
    assertString(topic, "home.topics[]");
  }

  if (!Array.isArray(settings.contactLinks)) {
    throw new Error("settings.contactLinks must be an array.");
  }

  for (const link of settings.contactLinks) {
    if (!link || typeof link.label !== "string" || typeof link.href !== "string") {
      throw new Error("Each contact link must include string label and href fields.");
    }
  }

  return settings;
};

export const getSiteSettings = async () => {
  return validateSettings(await readSettingsFile(settingsPath));
};
```

- [ ] **Step 3: Build**

Run:

```powershell
npm.cmd run build
```

Expected: build exits `0`.

- [ ] **Step 4: Commit**

Run:

```powershell
git add settings/settings.json src/lib/settings.ts
git commit -m "feat: expand site settings"
```

Expected: commit succeeds.

---

## Task 2: Wire Settings Across Existing Site

**Files:**
- Modify: `src/lib/site.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/archive.astro`
- Modify: `src/pages/categories/[category].astro`
- Modify: `src/pages/tags/[tag].astro`
- Modify: `src/pages/rss.xml.js`

- [ ] **Step 1: Keep fallback constants in `src/lib/site.ts`**

Ensure the constants remain available:

```ts
export const SITE_TITLE = "个人博客 | Notes & Fieldwork";
export const SITE_NAME = "Notes & Fieldwork";
export const SITE_DESCRIPTION = "一个记录思考、项目和生活观察的个人博客。";
export const SITE_AUTHOR = "Notes & Fieldwork";
```

Keep `withBase`, `absoluteUrl`, and `formatDate` unchanged.

- [ ] **Step 2: Update `src/layouts/BaseLayout.astro`**

Import settings:

```astro
import { getSiteSettings } from "../lib/settings";
```

Load settings before props defaults:

```astro
const settings = await getSiteSettings();
```

Use:

```astro
title = settings.site.title || SITE_TITLE,
description = settings.site.description || SITE_DESCRIPTION,
```

Replace brand/footer text:

```astro
<span class="brand-mark">{settings.site.brandInitial}</span>
<span>{settings.site.name}</span>
```

```astro
<p>{settings.site.footerText}</p>
```

- [ ] **Step 3: Update `src/layouts/PostLayout.astro`**

Import and load settings:

```astro
import { getSiteSettings } from "../lib/settings";
const settings = await getSiteSettings();
```

Use settings for title suffix and author:

```astro
title={`${title} | ${settings.site.name}`}
```

```ts
author: {
  "@type": "Person",
  name: settings.site.author,
},
```

- [ ] **Step 4: Update homepage settings usage**

In `src/pages/index.astro`, change:

```astro
const { contactLinks } = await getSiteSettings();
```

to:

```astro
const settings = await getSiteSettings();
const { contactLinks } = settings;
```

Use `settings.site.name` and `settings.site.description` in structured data.

Replace hero/about/contact hard-coded strings with:

```astro
{settings.home.eyebrow}
{settings.home.heroTitle}
{settings.home.heroCopy}
{settings.home.aboutEyebrow}
{settings.home.aboutTitle}
{settings.home.aboutCopy}
{settings.home.contactEyebrow}
{settings.home.contactTitle}
```

Render topics:

```astro
{settings.home.topics.map((topic) => <span>{topic}</span>)}
```

- [ ] **Step 5: Update archive/category/tag/RSS metadata**

Import `getSiteSettings()` in:

```text
src/pages/archive.astro
src/pages/categories/[category].astro
src/pages/tags/[tag].astro
src/pages/rss.xml.js
```

Use `settings.site.name` for title suffixes and `settings.site.description` for RSS description.

- [ ] **Step 6: Verify**

Run:

```powershell
npm.cmd run build
Select-String -Path dist\index.html -Pattern "Notes & Fieldwork","把想法写清楚","mailto:hello@2418631620@qq.com"
Select-String -Path dist\rss.xml -Pattern "Notes & Fieldwork"
```

Expected: build exits `0`; all `Select-String` commands print matches.

- [ ] **Step 7: Commit**

Run:

```powershell
git add src/lib/site.ts src/layouts/BaseLayout.astro src/layouts/PostLayout.astro src/pages/index.astro src/pages/archive.astro src/pages/categories/[category].astro src/pages/tags/[tag].astro src/pages/rss.xml.js
git commit -m "feat: use settings across site"
```

Expected: commit succeeds.

---

## Task 3: Add Custom 404 Page

**Files:**
- Create: `src/pages/404.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create `src/pages/404.astro`**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { getSiteSettings } from "../lib/settings";
import { withBase } from "../lib/site";

const settings = await getSiteSettings();
---

<BaseLayout
  title={`页面走丢了 | ${settings.site.name}`}
  description="这个页面不存在，可能已经移动或尚未发布。"
>
  <section class="not-found" aria-labelledby="not-found-title">
    <p class="eyebrow">404 / Not Found</p>
    <h1 id="not-found-title">这页像一张遗失的便签，暂时找不到了。</h1>
    <p>可能是链接写错了，也可能是文章还在草稿里。你可以回到首页、查看归档，或者继续浏览文章。</p>
    <div class="not-found-actions">
      <a class="button primary" href={withBase()}>回到首页</a>
      <a class="button ghost" href={withBase("archive/")}>查看归档</a>
      <a class="button ghost" href={withBase("#posts")}>浏览文章</a>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Add styles**

Append to `src/styles/global.css`:

```css
.not-found {
  min-height: 62vh;
  display: grid;
  place-items: center;
  text-align: center;
  padding: clamp(5rem, 12vw, 9rem) 1.25rem;
}

.not-found h1 {
  max-width: 760px;
  margin: 0 auto;
  font-family: var(--font-serif);
  font-size: clamp(2.7rem, 8vw, 5.8rem);
  line-height: 0.95;
}

.not-found p:not(.eyebrow) {
  max-width: 620px;
  margin: 1.5rem auto 0;
  color: var(--muted);
  font-size: 1.12rem;
}

.not-found-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.85rem;
  margin-top: 2rem;
}
```

- [ ] **Step 3: Verify**

Run:

```powershell
npm.cmd run build
Test-Path dist\404.html
Select-String -Path dist\404.html -Pattern "页面走丢了","回到首页","查看归档","浏览文章"
```

Expected: build exits `0`; `Test-Path` prints `True`; strings are present.

- [ ] **Step 4: Commit**

Run:

```powershell
git add src/pages/404.astro src/styles/global.css
git commit -m "feat: add custom 404 page"
```

Expected: commit succeeds.

---

## Task 4: Add Article Reading Time

**Files:**
- Create: `src/lib/reading.ts`
- Modify: `src/pages/posts/[slug].astro`
- Modify: `src/layouts/PostLayout.astro`

- [ ] **Step 1: Create `src/lib/reading.ts`**

```ts
const CHINESE_CHARACTER_PATTERN = /[\u3400-\u9fff]/g;
const LATIN_WORD_PATTERN = /[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g;
const MARKDOWN_SYNTAX_PATTERN = /[`*_>#\[\]()!|:-]/g;

export const calculateReadingTime = (markdown: string, wordsPerMinute = 350) => {
  const plainText = markdown.replace(MARKDOWN_SYNTAX_PATTERN, " ");
  const chineseCharacterCount = plainText.match(CHINESE_CHARACTER_PATTERN)?.length ?? 0;
  const latinWordCount = plainText.match(LATIN_WORD_PATTERN)?.length ?? 0;
  const readableUnits = chineseCharacterCount + latinWordCount;

  return Math.max(1, Math.ceil(readableUnits / wordsPerMinute));
};
```

- [ ] **Step 2: Update `src/pages/posts/[slug].astro`**

Import:

```astro
import { calculateReadingTime } from "../../lib/reading";
```

After rendering:

```astro
const readingTime = calculateReadingTime(post.body);
```

Pass:

```astro
readingTime={readingTime}
```

- [ ] **Step 3: Update `src/layouts/PostLayout.astro`**

Add prop:

```ts
readingTime: number;
```

Destructure it and render after date/category:

```astro
<span>{readingTime} 分钟阅读</span>
```

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run build
Select-String -Path dist\posts\build-notes\index.html -Pattern "分钟阅读"
```

Expected: build exits `0`; reading time appears.

- [ ] **Step 5: Commit**

Run:

```powershell
git add src/lib/reading.ts src/pages/posts/[slug].astro src/layouts/PostLayout.astro
git commit -m "feat: add article reading time"
```

Expected: commit succeeds.

---

## Task 5: Add Article Cover Images

**Files:**
- Create: `public/images/posts/build-notes.svg`
- Modify: `src/content/posts/build-notes.md`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create cover image**

Create `public/images/posts/build-notes.svg`:

```svg
<svg width="1200" height="720" viewBox="0 0 1200 720" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="720" fill="#F3EFE4"/>
  <path d="M0 520C180 455 314 482 480 520C671 563 828 578 1200 455V720H0V520Z" fill="#174D3A"/>
  <circle cx="1000" cy="176" r="120" fill="#E95B3C"/>
  <rect x="136" y="122" width="560" height="356" rx="22" fill="#FFF9EC" stroke="#1D2A27" stroke-width="6"/>
  <path d="M194 204H638" stroke="#1D2A27" stroke-width="18" stroke-linecap="round"/>
  <path d="M194 278H566" stroke="#6B7C76" stroke-width="14" stroke-linecap="round"/>
  <path d="M194 342H610" stroke="#6B7C76" stroke-width="14" stroke-linecap="round"/>
  <path d="M194 406H450" stroke="#6B7C76" stroke-width="14" stroke-linecap="round"/>
  <text x="136" y="616" fill="#FFF9EC" font-family="Georgia, serif" font-size="64" font-weight="700">Notes &amp; Fieldwork</text>
</svg>
```

- [ ] **Step 2: Add frontmatter image**

In `src/content/posts/build-notes.md`, add:

```yaml
image: "/images/posts/build-notes.svg"
```

- [ ] **Step 3: Render cover in article layout**

In `src/layouts/PostLayout.astro`, after tag list:

```astro
{image && (
  <figure class="post-cover">
    <img src={withBase(image)} alt={`《${title}》文章封面`} loading="eager" />
  </figure>
)}
```

- [ ] **Step 4: Render covers on homepage**

In `src/pages/index.astro`, add:

```ts
const resolveImagePath = (image?: string) => {
  if (!image) return undefined;
  if (/^https?:\/\//i.test(image)) return image;
  return withBase(image);
};
```

Render `feature-story-image` for featured posts and `post-card-image` for post cards when `post.data.image` exists.

- [ ] **Step 5: Add styles**

Append:

```css
.feature-story-image,
.post-card-image,
.post-cover img {
  display: block;
  width: 100%;
  object-fit: cover;
  border: 1px solid var(--line);
  background: var(--paper);
}

.feature-story-image {
  grid-column: 1 / -1;
  aspect-ratio: 16 / 9;
  margin-bottom: 1.25rem;
}

.post-card-image {
  aspect-ratio: 16 / 9;
  margin: -0.05rem 0 1.25rem;
}

.post-cover {
  margin: 2rem 0 2.5rem;
}

.post-cover img {
  max-height: 560px;
}
```

- [ ] **Step 6: Verify**

Run:

```powershell
npm.cmd run build
Test-Path public\images\posts\build-notes.svg
Select-String -Path dist\index.html -Pattern "build-notes.svg","feature-story-image","post-card-image"
Select-String -Path dist\posts\build-notes\index.html -Pattern "build-notes.svg","post-cover"
```

Expected: build exits `0`; all checks pass.

- [ ] **Step 7: Commit**

Run:

```powershell
git add public/images/posts/build-notes.svg src/content/posts/build-notes.md src/layouts/PostLayout.astro src/pages/index.astro src/styles/global.css
git commit -m "feat: add article cover images"
```

Expected: commit succeeds.

---

## Task 6: Add Reading Progress and Back-to-Top

**Files:**
- Create: `src/components/ReadingProgress.astro`
- Create: `src/scripts/reading-progress.js`
- Create: `public/scripts/reading-progress.js`
- Modify: `scripts/verify-public-scripts.mjs`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create `src/components/ReadingProgress.astro`**

```astro
---
import { withBase } from "../lib/site";
---

<div class="reading-progress" aria-hidden="true">
  <span data-reading-progress-bar></span>
</div>
<button class="back-to-top" type="button" data-back-to-top aria-label="回到文章顶部">
  ↑
</button>
<script src={withBase("scripts/reading-progress.js")} defer></script>
```

- [ ] **Step 2: Create synced scripts**

Create both `src/scripts/reading-progress.js` and `public/scripts/reading-progress.js` with identical content:

```js
(() => {
  const progressBar = document.querySelector("[data-reading-progress-bar]");
  const backToTop = document.querySelector("[data-back-to-top]");

  if (!progressBar || !backToTop) return;

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100)) : 0;

    progressBar.style.width = `${progress}%`;
    backToTop.toggleAttribute("data-visible", scrollTop > 480);
  };

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
})();
```

- [ ] **Step 3: Update script sync guard**

In `scripts/verify-public-scripts.mjs`, include:

```js
["src/scripts/reading-progress.js", "public/scripts/reading-progress.js"],
```

- [ ] **Step 4: Render component**

In `src/layouts/PostLayout.astro`, import and render:

```astro
import ReadingProgress from "../components/ReadingProgress.astro";
```

```astro
<ReadingProgress />
```

- [ ] **Step 5: Add styles**

Append:

```css
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 80;
  width: 100%;
  height: 4px;
  background: transparent;
}

.reading-progress span {
  display: block;
  width: 0;
  height: 100%;
  background: var(--accent);
  transition: width 120ms ease-out;
}

.back-to-top {
  position: fixed;
  right: clamp(1rem, 3vw, 2rem);
  bottom: clamp(1rem, 3vw, 2rem);
  z-index: 70;
  width: 3rem;
  height: 3rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transform: translateY(0.75rem);
  transition: opacity 180ms ease, transform 180ms ease;
}

.back-to-top[data-visible] {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
```

- [ ] **Step 6: Verify**

Run:

```powershell
npm.cmd run verify:public-scripts
npm.cmd run build
Test-Path dist\scripts\reading-progress.js
Select-String -Path dist\posts\build-notes\index.html -Pattern "reading-progress","data-back-to-top","reading-progress.js"
```

Expected: sync verification and build pass; script and markup are present.

- [ ] **Step 7: Commit**

Run:

```powershell
git add src/components/ReadingProgress.astro src/scripts/reading-progress.js public/scripts/reading-progress.js scripts/verify-public-scripts.mjs src/layouts/PostLayout.astro src/styles/global.css
git commit -m "feat: add reading progress controls"
```

Expected: commit succeeds.

---

## Task 7: Documentation, Final Verification, and Push

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README**

Document:

```markdown
## 配置网站信息和联系方式

网站基础信息、首页文案、About 主题和 Contact 链接都集中在 `settings/settings.json`。

常用字段：
- `site.name`：站点名称。
- `site.brandInitial`：左上角圆形 Logo 里的字母。
- `site.footerText`：页脚版权文字。
- `home.heroTitle` / `home.heroCopy`：首页首屏标题和介绍。
- `home.aboutTitle` / `home.aboutCopy` / `home.topics`：About 区内容。
- `contactLinks`：Contact 区链接列表。

站点包含自定义 `404.html` 页面。访问不存在的路径时，会显示返回首页、查看归档和浏览文章入口。
```

Also document:

```markdown
如果想给文章设置封面图，可以在 frontmatter 中添加：

```yaml
image: "/images/posts/example.svg"
```

封面图会显示在首页文章卡片、推荐文章区和文章详情页。图片建议放在 `public/images/posts/`。

文章页会自动显示预计阅读时间、阅读进度条和返回顶部按钮。预计阅读时间根据 Markdown 正文内容在构建时计算，不需要手动填写。
```
```

- [ ] **Step 2: Final build**

Run:

```powershell
npm.cmd run build
```

Expected: build exits `0`.

- [ ] **Step 3: Final output checks**

Run:

```powershell
Test-Path dist\index.html
Test-Path dist\404.html
Test-Path dist\rss.xml
Test-Path dist\posts\build-notes\index.html
Test-Path dist\scripts\reading-progress.js
Select-String -Path dist\index.html -Pattern "mailto:hello@2418631620@qq.com","https://github.com/Liyolo","build-notes.svg"
Select-String -Path dist\404.html -Pattern "页面走丢了","回到首页"
Select-String -Path dist\posts\build-notes\index.html -Pattern "分钟阅读","post-cover","reading-progress","data-back-to-top","busuanzi_value_page_pv"
Select-String -Path dist\rss.xml -Pattern "Notes & Fieldwork"
git status --short
```

Expected: `Test-Path` commands print `True`; `Select-String` commands print matches; `git status --short` only shows README before commit.

- [ ] **Step 4: Commit docs**

Run:

```powershell
git add README.md
git commit -m "docs: document blog polish features"
```

Expected: commit succeeds.

- [ ] **Step 5: Push**

Run:

```powershell
git push origin main
```

Expected: push succeeds and GitHub Pages deployment starts.

---

## Self-Review

- Spec coverage: This merged plan covers the full scope of both prior plans: Settings, existing page wiring, custom 404, cover images, reading time, reading progress/back-to-top, README, final verification, and push.
- Placeholder scan: No TODO/TBD placeholders remain; every code-changing task includes exact code or concrete target snippets.
- Type consistency: `SiteSettings`, `HomeSettings`, `ContactLink`, `calculateReadingTime`, `readingTime`, `ReadingProgress`, and `reading-progress.js` are defined before use.
- Scope check: The merged plan avoids CMS, uploads, comments, and unrelated design changes. It is one coherent polish pass for the existing static blog.

