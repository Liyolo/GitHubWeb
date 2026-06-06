# Cover Images and Reading Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add article cover image rendering and improve long-form reading with estimated reading time, a reading progress bar, and a back-to-top control.

**Architecture:** Use the existing optional `image` frontmatter field and render it on post cards, featured posts, and article pages without changing the content collection shape. Add a small reading-time helper for build-time metadata and a tiny synced browser script for reading progress/back-to-top behavior, following the existing `src/scripts` + `public/scripts` pattern.

**Tech Stack:** Astro 5, TypeScript, static Markdown content, plain CSS, plain browser JavaScript, GitHub Pages.

---

## File Structure

- Create: `src/lib/reading.ts`  
  Calculates estimated reading minutes from Markdown body text.
- Create: `src/components/ReadingProgress.astro`  
  Renders the fixed progress bar and back-to-top button on article pages.
- Create: `src/scripts/reading-progress.js` and `public/scripts/reading-progress.js`  
  Keeps the progress bar width in sync with scroll position and toggles the back-to-top button.
- Create: `public/images/posts/build-notes.svg`  
  Provides one lightweight local SVG cover image for the existing featured article.
- Modify: `scripts/verify-public-scripts.mjs`  
  Adds the new reading progress script to the public script sync guard.
- Modify: `src/pages/posts/[slug].astro`  
  Calculates reading time from `post.body` and passes it into `PostLayout`.
- Modify: `src/layouts/PostLayout.astro`  
  Displays cover image, reading time, and reading progress controls.
- Modify: `src/pages/index.astro`  
  Displays cover images in the featured area and post cards when present.
- Modify: `src/styles/global.css`  
  Adds cover image, reading time, progress bar, and back-to-top styles.
- Modify: `src/content/posts/build-notes.md`  
  Adds a sample `image` frontmatter value.
- Modify: `README.md`  
  Documents cover image frontmatter and reading experience behavior.

---

## Task 1: Reading Time Helper

**Files:**
- Create: `src/lib/reading.ts`
- Modify: `src/pages/posts/[slug].astro`
- Modify: `src/layouts/PostLayout.astro`

- [ ] **Step 1: Create `src/lib/reading.ts`**

Create this file:

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

Add the import:

```astro
import { calculateReadingTime } from "../../lib/reading";
```

After rendering the post, calculate reading time:

```astro
const readingTime = calculateReadingTime(post.body);
```

Pass it into `PostLayout`:

```astro
readingTime={readingTime}
```

- [ ] **Step 3: Update `src/layouts/PostLayout.astro` props**

Add `readingTime` to the props interface:

```ts
readingTime: number;
```

Include it in destructuring:

```ts
const { title, description, slug, pubDate, category, tags, headings, image, readingTime, previousPost, nextPost } = Astro.props;
```

Add it to the article meta after the date/category span:

```astro
<span>{readingTime} 分钟阅读</span>
```

Keep `<VisitCounter type="page" />` after this reading-time span.

- [ ] **Step 4: Build and verify reading time appears**

Run:

```powershell
npm.cmd run build
Select-String -Path dist\posts\build-notes\index.html -Pattern "分钟阅读"
```

Expected: build exits `0`; `Select-String` prints a match containing `分钟阅读`.

- [ ] **Step 5: Commit reading time helper**

Run:

```powershell
git add src/lib/reading.ts src/pages/posts/[slug].astro src/layouts/PostLayout.astro
git commit -m "feat: add article reading time"
```

Expected: commit succeeds.

---

## Task 2: Article Cover Image Rendering

**Files:**
- Create: `public/images/posts/build-notes.svg`
- Modify: `src/content/posts/build-notes.md`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create a sample cover image**

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

- [ ] **Step 2: Add cover frontmatter to `src/content/posts/build-notes.md`**

Add the `image` field under `featured: true`:

```yaml
image: "/images/posts/build-notes.svg"
```

- [ ] **Step 3: Render cover image in `src/layouts/PostLayout.astro`**

After the tag list and before `article-content`, add:

```astro
{image && (
  <figure class="post-cover">
    <img src={withBase(image)} alt={`《${title}》文章封面`} loading="eager" />
  </figure>
)}
```

Use the existing local `withBase` helper in `PostLayout.astro`.

- [ ] **Step 4: Render featured cover on the homepage**

In `src/pages/index.astro`, add this helper near the other constants:

```ts
const resolveImagePath = (image?: string) => {
  if (!image) return undefined;
  if (/^https?:\/\//i.test(image)) return image;
  return withBase(image);
};
```

Inside `<article class="feature-story">`, render the cover before the text columns:

```astro
{featured.data.image && (
  <img
    class="feature-story-image"
    src={resolveImagePath(featured.data.image)}
    alt={`《${featured.data.title}》文章封面`}
    loading="lazy"
  />
)}
```

- [ ] **Step 5: Render card thumbnails on the homepage**

Inside each `<article class="post-card">`, before the post meta, add:

```astro
{post.data.image && (
  <img
    class="post-card-image"
    src={resolveImagePath(post.data.image)}
    alt={`《${post.data.title}》文章封面`}
    loading="lazy"
  />
)}
```

- [ ] **Step 6: Add cover styles to `src/styles/global.css`**

Append these styles near existing featured/post-card/article styles:

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

- [ ] **Step 7: Build and verify cover output**

Run:

```powershell
npm.cmd run build
Test-Path public\images\posts\build-notes.svg
Select-String -Path dist\index.html -Pattern "build-notes.svg","feature-story-image","post-card-image"
Select-String -Path dist\posts\build-notes\index.html -Pattern "build-notes.svg","post-cover"
```

Expected: build exits `0`; `Test-Path` prints `True`; all `Select-String` commands print matches.

- [ ] **Step 8: Commit cover image rendering**

Run:

```powershell
git add public/images/posts/build-notes.svg src/content/posts/build-notes.md src/layouts/PostLayout.astro src/pages/index.astro src/styles/global.css
git commit -m "feat: add article cover images"
```

Expected: commit succeeds.

---

## Task 3: Reading Progress and Back-to-Top Control

**Files:**
- Create: `src/components/ReadingProgress.astro`
- Create: `src/scripts/reading-progress.js`
- Create: `public/scripts/reading-progress.js`
- Modify: `scripts/verify-public-scripts.mjs`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create `src/components/ReadingProgress.astro`**

Create this file:

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

- [ ] **Step 2: Create `src/scripts/reading-progress.js`**

Create this file:

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

- [ ] **Step 3: Copy script to `public/scripts/reading-progress.js`**

Create `public/scripts/reading-progress.js` with exactly the same content as `src/scripts/reading-progress.js`.

- [ ] **Step 4: Update public script verification**

In `scripts/verify-public-scripts.mjs`, add the pair:

```js
["src/scripts/reading-progress.js", "public/scripts/reading-progress.js"],
```

The `scriptPairs` array should contain:

```js
const scriptPairs = [
  ["src/scripts/post-search.js", "public/scripts/post-search.js"],
  ["src/scripts/visit-counter.js", "public/scripts/visit-counter.js"],
  ["src/scripts/reading-progress.js", "public/scripts/reading-progress.js"],
];
```

- [ ] **Step 5: Render `ReadingProgress` in `src/layouts/PostLayout.astro`**

Import the component:

```astro
import ReadingProgress from "../components/ReadingProgress.astro";
```

Render it as the first child inside `<BaseLayout>`:

```astro
<ReadingProgress />
```

- [ ] **Step 6: Add progress styles to `src/styles/global.css`**

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

- [ ] **Step 7: Build and verify scripts**

Run:

```powershell
npm.cmd run verify:public-scripts
npm.cmd run build
Test-Path dist\scripts\reading-progress.js
Select-String -Path dist\posts\build-notes\index.html -Pattern "reading-progress","data-back-to-top","reading-progress.js"
```

Expected: sync verification succeeds; build exits `0`; script exists; article HTML contains the progress UI and script reference.

- [ ] **Step 8: Commit reading progress**

Run:

```powershell
git add src/components/ReadingProgress.astro src/scripts/reading-progress.js public/scripts/reading-progress.js scripts/verify-public-scripts.mjs src/layouts/PostLayout.astro src/styles/global.css
git commit -m "feat: add reading progress controls"
```

Expected: commit succeeds.

---

## Task 4: Documentation and Final Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document cover image usage**

In `README.md`, under the article writing/frontmatter section, add:

```markdown
如果想给文章设置封面图，可以在 frontmatter 中添加：

```yaml
image: "/images/posts/example.svg"
```

封面图会显示在首页文章卡片、推荐文章区和文章详情页。图片文件建议放在：

```text
public/images/posts/
```

本地图片路径不需要写 `/GitHubWeb` 前缀，构建时会自动处理 GitHub Pages 的 base path。
```
```

- [ ] **Step 2: Document reading experience**

In the same README section, add:

```markdown
文章页会自动显示预计阅读时间、阅读进度条和返回顶部按钮。预计阅读时间根据 Markdown 正文内容在构建时计算，不需要手动填写。
```

- [ ] **Step 3: Final build**

Run:

```powershell
npm.cmd run build
```

Expected: build exits `0`.

- [ ] **Step 4: Final output checks**

Run:

```powershell
Test-Path dist\index.html
Test-Path dist\posts\build-notes\index.html
Test-Path dist\scripts\reading-progress.js
Select-String -Path dist\index.html -Pattern "build-notes.svg","feature-story-image","post-card-image"
Select-String -Path dist\posts\build-notes\index.html -Pattern "分钟阅读","post-cover","reading-progress","data-back-to-top"
Select-String -Path dist\posts\build-notes\index.html -Pattern "busuanzi_value_page_pv"
git status --short
```

Expected: `Test-Path` commands print `True`; all `Select-String` commands print matches; `git status --short` only shows README before commit.

- [ ] **Step 5: Commit docs**

Run:

```powershell
git add README.md
git commit -m "docs: document cover images and reading experience"
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

- Spec coverage: The plan covers article cover image rendering on homepage/cards/post pages, sample cover asset, reading time, reading progress, back-to-top, public script sync, README docs, build verification, and push.
- Placeholder scan: No implementation placeholders remain; every code-changing step includes exact code or exact commands.
- Type consistency: `calculateReadingTime`, `readingTime`, `ReadingProgress`, `reading-progress.js`, and `image` are defined before use and referenced consistently.
- Scope check: The plan does not add CMS, image upload tooling, comments, or analytics changes. It stays focused on cover images and reading experience.

