# Site Settings and 404 Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize site identity/content settings in `settings/settings.json` and add a polished custom 404 page.

**Architecture:** Extend the existing `src/lib/settings.ts` loader so build-time Astro pages can read site identity, hero/about copy, contact links, and footer text from one JSON file. Update layouts/pages to consume those settings, then add `src/pages/404.astro` using the existing visual language and navigation helpers.

**Tech Stack:** Astro 5, TypeScript, JSON settings, static GitHub Pages build.

---

## File Structure

- Modify: `settings/settings.json`  
  Holds editable site configuration: brand, metadata, hero copy, About copy, topic chips, footer text, contact links.
- Modify: `src/lib/settings.ts`  
  Defines settings types, validates required arrays/strings, exposes `getSiteSettings()`.
- Modify: `src/layouts/BaseLayout.astro`  
  Reads settings for default page title, site name, brand mark, nav brand, footer copyright.
- Modify: `src/layouts/PostLayout.astro`  
  Reads settings for article title suffix, author name, JSON-LD author.
- Modify: `src/pages/index.astro`  
  Reads settings for structured data, hero, About section, contact links, and topic chips.
- Modify: `src/pages/archive.astro`, `src/pages/categories/[category].astro`, `src/pages/tags/[tag].astro`, `src/pages/rss.xml.js`  
  Replace hard-coded `Notes & Fieldwork` references with settings values.
- Create: `src/pages/404.astro`  
  Adds a custom 404 page with links back to home, archive, and posts section.
- Modify: `src/styles/global.css`  
  Adds 404-specific styles, reusing existing colors, typography, and button language.
- Modify: `README.md`  
  Documents how to edit site identity and contact settings.

---

## Task 1: Expand Settings Schema and Data

**Files:**
- Modify: `settings/settings.json`
- Modify: `src/lib/settings.ts`

- [ ] **Step 1: Replace `settings/settings.json` with full site settings**

Use this exact structure, preserving the current contact values:

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

- [ ] **Step 2: Update settings types in `src/lib/settings.ts`**

Replace the file with:

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

- [ ] **Step 3: Run build to verify settings schema**

Run:

```powershell
npm.cmd run build
```

Expected: build succeeds and still builds 17 pages.

- [ ] **Step 4: Commit settings expansion**

Run:

```powershell
git add settings/settings.json src/lib/settings.ts
git commit -m "feat: expand site settings"
```

Expected: commit succeeds.

---

## Task 2: Wire Settings into Layouts and Existing Pages

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/archive.astro`
- Modify: `src/pages/categories/[category].astro`
- Modify: `src/pages/tags/[tag].astro`
- Modify: `src/pages/rss.xml.js`
- Modify: `src/lib/site.ts`

- [ ] **Step 1: Update `src/lib/site.ts` constants**

Replace the constants with neutral fallbacks used only where settings are unavailable:

```ts
export const SITE_TITLE = "个人博客 | Notes & Fieldwork";
export const SITE_NAME = "Notes & Fieldwork";
export const SITE_DESCRIPTION = "一个记录思考、项目和生活观察的个人博客。";
export const SITE_AUTHOR = "Notes & Fieldwork";
```

Keep existing `withBase`, `absoluteUrl`, and `formatDate` unchanged.

- [ ] **Step 2: Update `src/layouts/BaseLayout.astro`**

Import settings and derive defaults:

```astro
---
import VisitCounter from "../components/VisitCounter.astro";
import { getSiteSettings } from "../lib/settings";
import { SITE_DESCRIPTION, SITE_TITLE, withBase } from "../lib/site";

const settings = await getSiteSettings();

interface Props {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  structuredData?: Record<string, unknown>;
}

const {
  title = settings.site.title || SITE_TITLE,
  description = settings.site.description || SITE_DESCRIPTION,
  image,
  type = "website",
  structuredData,
} = Astro.props;
```

Then replace brand/footer hard-coded text:

```astro
<span class="brand-mark">{settings.site.brandInitial}</span>
<span>{settings.site.name}</span>
```

```astro
<p>{settings.site.footerText}</p>
```

- [ ] **Step 3: Update `src/layouts/PostLayout.astro`**

Import and use settings:

```astro
import { getSiteSettings } from "../lib/settings";
const settings = await getSiteSettings();
```

Replace title suffix:

```astro
title={`${title} | ${settings.site.name}`}
```

Replace JSON-LD author:

```ts
author: {
  "@type": "Person",
  name: settings.site.author,
},
```

- [ ] **Step 4: Update `src/pages/index.astro`**

Use settings for structured data and homepage copy:

```astro
const settings = await getSiteSettings();
const { contactLinks } = settings;
```

Replace structured data values:

```ts
name: settings.site.name,
description: settings.site.description,
```

Replace hero/about/contact hard-coded strings:

```astro
<p class="eyebrow">{settings.home.eyebrow}</p>
<h1 id="hero-title">{settings.home.heroTitle}</h1>
<p class="hero-copy">{settings.home.heroCopy}</p>
```

```astro
<p class="eyebrow">{settings.home.aboutEyebrow}</p>
<h2 id="about-title">{settings.home.aboutTitle}</h2>
<p>{settings.home.aboutCopy}</p>
```

```astro
{settings.home.topics.map((topic) => <span>{topic}</span>)}
```

```astro
<p class="eyebrow">{settings.home.contactEyebrow}</p>
<h2 id="contact-title">{settings.home.contactTitle}</h2>
```

- [ ] **Step 5: Update archive/category/tag page titles**

In `src/pages/archive.astro`, `src/pages/categories/[category].astro`, and `src/pages/tags/[tag].astro`, import `getSiteSettings`, then replace `Notes & Fieldwork` text with `settings.site.name`.

Example for archive:

```astro
const settings = await getSiteSettings();
const archiveDescription = `${settings.site.name} 的全部文章归档。`;
```

Use:

```astro
<BaseLayout title={`文章归档 | ${settings.site.name}`} description={archiveDescription} structuredData={structuredData}>
```

- [ ] **Step 6: Update RSS title/description**

In `src/pages/rss.xml.js`, import and call settings:

```js
import { getSiteSettings } from "../lib/settings";
```

Inside `GET`:

```js
const settings = await getSiteSettings();
```

Use:

```js
title: settings.site.name,
description: settings.site.description,
```

- [ ] **Step 7: Run build and inspect output**

Run:

```powershell
npm.cmd run build
Select-String -Path dist\index.html -Pattern "Notes & Fieldwork","把想法写清楚","mailto:hello@2418631620@qq.com"
Select-String -Path dist\rss.xml -Pattern "Notes & Fieldwork"
```

Expected: build succeeds; matches confirm settings-backed content still renders.

- [ ] **Step 8: Commit settings wiring**

Run:

```powershell
git add src/layouts/BaseLayout.astro src/layouts/PostLayout.astro src/pages/index.astro src/pages/archive.astro src/pages/categories/[category].astro src/pages/tags/[tag].astro src/pages/rss.xml.js src/lib/site.ts
git commit -m "feat: use settings across site"
```

Expected: commit succeeds.

---

## Task 3: Add Custom 404 Page

**Files:**
- Create: `src/pages/404.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create `src/pages/404.astro`**

Create this file:

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
    <p>
      可能是链接写错了，也可能是文章还在草稿里。你可以回到首页、查看归档，或者继续浏览文章。
    </p>
    <div class="not-found-actions">
      <a class="button primary" href={withBase()}>回到首页</a>
      <a class="button ghost" href={withBase("archive/")}>查看归档</a>
      <a class="button ghost" href={withBase("#posts")}>浏览文章</a>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Add 404 styles to `src/styles/global.css`**

Append near the section styles:

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

- [ ] **Step 3: Run build and verify 404 output**

Run:

```powershell
npm.cmd run build
Test-Path dist\404.html
Select-String -Path dist\404.html -Pattern "页面走丢了","回到首页","查看归档","浏览文章"
```

Expected: build succeeds; `Test-Path` prints `True`; all strings are present.

- [ ] **Step 4: Commit 404 page**

Run:

```powershell
git add src/pages/404.astro src/styles/global.css
git commit -m "feat: add custom 404 page"
```

Expected: commit succeeds.

---

## Task 4: Documentation and Final Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document expanded settings**

Update the `配置联系方式` section into `配置网站信息和联系方式`, and describe:

```markdown
## 配置网站信息和联系方式

网站的基础信息、首页文案、About 主题和 Contact 链接都集中在：

```text
settings/settings.json
```

常用字段：

- `site.name`：站点名称，会显示在导航、标题后缀、RSS 等位置。
- `site.brandInitial`：左上角圆形 Logo 里的字母。
- `site.footerText`：页脚版权文字。
- `home.heroTitle` / `home.heroCopy`：首页首屏标题和介绍。
- `home.aboutTitle` / `home.aboutCopy` / `home.topics`：About 区内容。
- `contactLinks`：Contact 区链接列表。

修改配置后运行：

```powershell
npm.cmd run build
```

构建通过后提交并推送即可更新 GitHub Pages。
```
```

- [ ] **Step 2: Document custom 404**

Append to the same section:

```markdown
站点包含自定义 `404.html` 页面。访问不存在的路径时，会显示返回首页、查看归档和浏览文章入口。
```

- [ ] **Step 3: Final build**

Run:

```powershell
npm.cmd run build
```

Expected: build succeeds.

- [ ] **Step 4: Final output checks**

Run:

```powershell
Test-Path dist\index.html
Test-Path dist\404.html
Test-Path dist\rss.xml
Select-String -Path dist\index.html -Pattern "mailto:hello@2418631620@qq.com","https://github.com/Liyolo"
Select-String -Path dist\404.html -Pattern "页面走丢了","回到首页"
Select-String -Path dist\rss.xml -Pattern "Notes & Fieldwork"
git status --short
```

Expected: `Test-Path` commands print `True`; `Select-String` commands print matches; `git status --short` only shows README before commit.

- [ ] **Step 5: Commit docs**

Run:

```powershell
git add README.md
git commit -m "docs: document site settings and 404 page"
```

Expected: commit succeeds.

- [ ] **Step 6: Push**

Run:

```powershell
git push origin main
```

Expected: push succeeds and GitHub Pages deployment starts.

---

## Self-Review

- Spec coverage: The plan covers configurable site identity, homepage/About/footer content, contact links, RSS/page metadata, custom 404 page, README documentation, build checks, and push.
- Placeholder scan: No TODO/TBD placeholders remain; each task includes exact file paths and commands.
- Type consistency: `SiteSettings`, `SiteIdentitySettings`, `HomeSettings`, `ContactLink`, and `getSiteSettings()` are defined before use and reused consistently.
- Scope check: The plan is intentionally limited to configuration and 404 UX. It does not add CMS, image uploads, or unrelated article features.

