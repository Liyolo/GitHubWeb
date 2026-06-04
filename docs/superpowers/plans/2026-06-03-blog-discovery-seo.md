# Blog Discovery SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the Astro Markdown blog with category pages, tag pages, article table of contents, and stronger SEO/share metadata.

**Architecture:** Keep the site fully static. Add small shared helpers for URL building and post sorting, generate taxonomy pages from the existing content collection, render a table of contents from Markdown headings, and extend layouts with Open Graph, Twitter Card, and JSON-LD metadata.

**Tech Stack:** Astro, Markdown content collections, TypeScript helpers, static route generation, CSS, GitHub Pages.

---

## File Structure

- Create: `src/lib/site.ts` for site constants, base-path URL helpers, and date formatting.
- Create: `src/lib/posts.ts` for sorted posts, category lists, tag lists, and slug helpers.
- Create: `src/components/TableOfContents.astro` for article heading navigation.
- Modify: `src/content/config.ts` to support optional `image` and `draft` frontmatter.
- Modify: `src/layouts/BaseLayout.astro` to accept canonical URL, Open Graph type/image, and structured data.
- Modify: `src/layouts/PostLayout.astro` to render table of contents and article metadata.
- Modify: `src/pages/index.astro` to use shared helpers and link to category/tag pages.
- Modify: `src/pages/archive.astro` to use shared helpers.
- Modify: `src/pages/posts/[slug].astro` to pass headings and structured data into `PostLayout`.
- Modify: `src/pages/rss.xml.js` to use shared URL helpers.
- Create: `src/pages/categories/[category].astro` for category archive pages.
- Create: `src/pages/tags/[tag].astro` for tag archive pages.
- Modify: `src/styles/global.css` for taxonomy links, taxonomy pages, table of contents, and article SEO-friendly reading layout.
- Modify: `README.md` to document categories, tags, table of contents, images, and draft behavior.

## Task 1: Shared Site and Post Helpers

**Files:**
- Create: `src/lib/site.ts`
- Create: `src/lib/posts.ts`
- Modify: `src/content/config.ts`

- [ ] **Step 1: Create `src/lib/site.ts`**

Create `src/lib/site.ts` with this exact content:

```ts
export const SITE_TITLE = "个人博客 | Notes & Fieldwork";
export const SITE_NAME = "Notes & Fieldwork";
export const SITE_DESCRIPTION = "一个记录思考、项目和生活观察的个人博客。";
export const SITE_AUTHOR = "Notes & Fieldwork";
export const CATEGORY_NAMES = ["项目", "学习", "生活"] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];

export const basePath = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const withBase = (path = "") => `${basePath}${path.replace(/^\/+/, "")}`;

export const absoluteUrl = (path = "", site = "https://liyolo.github.io") =>
  new URL(withBase(path), site).toString();

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
```

- [ ] **Step 2: Create `src/lib/posts.ts`**

Create `src/lib/posts.ts` with this exact content:

```ts
import type { CollectionEntry } from "astro:content";
import { CATEGORY_NAMES } from "./site";

export type BlogPost = CollectionEntry<"posts">;

export const sortPostsNewestFirst = (posts: BlogPost[]) =>
  [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

export const getPublishedPosts = (posts: BlogPost[]) =>
  sortPostsNewestFirst(posts.filter((post) => !post.data.draft));

export const getCategories = (posts: BlogPost[]) =>
  CATEGORY_NAMES.map((category) => ({
    name: category,
    posts: posts.filter((post) => post.data.category === category),
  })).filter((entry) => entry.posts.length > 0);

export const getTags = (posts: BlogPost[]) => {
  const counts = new Map<string, BlogPost[]>();

  posts.forEach((post) => {
    post.data.tags.forEach((tag) => {
      counts.set(tag, [...(counts.get(tag) ?? []), post]);
    });
  });

  return [...counts.entries()]
    .map(([name, taggedPosts]) => ({
      name,
      slug: encodeURIComponent(name),
      posts: sortPostsNewestFirst(taggedPosts),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
};

export const categorySlug = (category: string) => encodeURIComponent(category);

export const tagSlug = (tag: string) => encodeURIComponent(tag);
```

- [ ] **Step 3: Modify `src/content/config.ts`**

Replace `src/content/config.ts` with this exact content:

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
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
```

- [ ] **Step 4: Run build**

Run:

```powershell
npm.cmd run build
```

Expected: command exits `0`.

- [ ] **Step 5: Commit helpers**

Run:

```powershell
git add src/lib/site.ts src/lib/posts.ts src/content/config.ts
git commit -m "feat: add blog metadata helpers"
```

Expected: commit succeeds.

## Task 2: Category and Tag Pages

**Files:**
- Create: `src/pages/categories/[category].astro`
- Create: `src/pages/tags/[tag].astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/archive.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create `src/pages/categories/[category].astro`**

Create `src/pages/categories/[category].astro` with this exact content:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import { getPublishedPosts, getCategories, categorySlug } from "../../lib/posts";
import { formatDate, withBase } from "../../lib/site";

export async function getStaticPaths() {
  const posts = getPublishedPosts(await getCollection("posts"));

  return getCategories(posts).map((entry) => ({
    params: { category: categorySlug(entry.name) },
    props: { category: entry.name, posts: entry.posts },
  }));
}

const { category, posts } = Astro.props;
---

<BaseLayout title={`${category} 分类 | Notes & Fieldwork`} description={`Notes & Fieldwork 中 ${category} 分类下的全部文章。`}>
  <section class="post-page taxonomy-page">
    <a class="back-link" href={withBase()}>← 返回首页</a>
    <p class="eyebrow">Category</p>
    <h1>{category}</h1>
    <p class="post-description">这个分类下共有 {posts.length} 篇文章。</p>
    <div class="archive-list">
      {posts.map((post) => (
        <article class="archive-item">
          <time datetime={post.data.pubDate.toISOString()}>{formatDate(post.data.pubDate)}</time>
          <div>
            <a href={withBase(`posts/${post.slug}/`)}>{post.data.title}</a>
            <p>{post.data.description}</p>
          </div>
        </article>
      ))}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/tags/[tag].astro`**

Create `src/pages/tags/[tag].astro` with this exact content:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import { getPublishedPosts, getTags } from "../../lib/posts";
import { formatDate, withBase } from "../../lib/site";

export async function getStaticPaths() {
  const posts = getPublishedPosts(await getCollection("posts"));

  return getTags(posts).map((entry) => ({
    params: { tag: entry.slug },
    props: { tag: entry.name, posts: entry.posts },
  }));
}

const { tag, posts } = Astro.props;
---

<BaseLayout title={`${tag} 标签 | Notes & Fieldwork`} description={`Notes & Fieldwork 中带有 ${tag} 标签的全部文章。`}>
  <section class="post-page taxonomy-page">
    <a class="back-link" href={withBase()}>← 返回首页</a>
    <p class="eyebrow">Tag</p>
    <h1>{tag}</h1>
    <p class="post-description">这个标签下共有 {posts.length} 篇文章。</p>
    <div class="archive-list">
      {posts.map((post) => (
        <article class="archive-item">
          <time datetime={post.data.pubDate.toISOString()}>{formatDate(post.data.pubDate)}</time>
          <div>
            <a href={withBase(`posts/${post.slug}/`)}>{post.data.title}</a>
            <p>{post.data.description}</p>
          </div>
        </article>
      ))}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Modify `src/pages/index.astro` imports**

In `src/pages/index.astro`, replace the current helper setup at the top with this exact block:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../layouts/BaseLayout.astro";
import { categorySlug, getPublishedPosts, getTags, tagSlug } from "../lib/posts";
import { formatDate, withBase } from "../lib/site";

const posts = getPublishedPosts(await getCollection("posts"));
const featured = posts.find((post) => post.data.featured) ?? posts[0];
const tags = getTags(posts).slice(0, 12);
---
```

- [ ] **Step 4: Modify category and post links in `src/pages/index.astro`**

In each post card inside `src/pages/index.astro`, replace the metadata paragraph with this exact content:

```astro
<p class="post-meta">
  {formatDate(post.data.pubDate)} ·
  <a href={withBase(`categories/${categorySlug(post.data.category)}/`)}>{post.data.category}</a>
</p>
```

Inside each `.post-card`, directly before the `阅读全文` link, add this exact tag list:

```astro
<div class="mini-tag-list">
  {post.data.tags.map((tag) => (
    <a href={withBase(`tags/${tagSlug(tag)}/`)}>{tag}</a>
  ))}
</div>
```

After the `post-grid` closing `</div>`, add this exact section:

```astro
{tags.length > 0 && (
  <div class="topic-cloud" aria-label="热门标签">
    <p class="eyebrow">Tags</p>
    {tags.map((entry) => (
      <a href={withBase(`tags/${entry.slug}/`)}>{entry.name}</a>
    ))}
  </div>
)}
```

- [ ] **Step 5: Modify `src/pages/archive.astro`**

Replace the imports and post setup in `src/pages/archive.astro` with this exact block:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../layouts/BaseLayout.astro";
import { getPublishedPosts } from "../lib/posts";
import { formatDate, withBase } from "../lib/site";

const posts = getPublishedPosts(await getCollection("posts"));
---
```

Ensure all archive links use `withBase(...)` instead of locally duplicated base helpers.

- [ ] **Step 6: Add taxonomy CSS**

Append this exact CSS to `src/styles/global.css`:

```css
.post-meta a {
  color: var(--pine);
  font-weight: 900;
  text-decoration: none;
}

.mini-tag-list,
.topic-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mini-tag-list {
  margin: 0.8rem 0 1.1rem;
}

.mini-tag-list a,
.topic-cloud a {
  padding: 0.3rem 0.65rem;
  border: 1px solid rgba(24, 33, 31, 0.14);
  border-radius: 999px;
  color: var(--pine);
  background: rgba(255, 250, 240, 0.72);
  font-size: 0.88rem;
  font-weight: 900;
  text-decoration: none;
}

.topic-cloud {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--line);
}

.taxonomy-page h1 {
  max-width: 760px;
}
```

- [ ] **Step 7: Run build and verify generated taxonomy pages**

Run:

```powershell
npm.cmd run build
```

Expected: command exits `0`, and generated output includes category and tag pages such as:

```text
dist/categories/%E9%A1%B9%E7%9B%AE/index.html
dist/tags/Astro/index.html
```

- [ ] **Step 8: Commit taxonomy pages**

Run:

```powershell
git add src/pages/categories src/pages/tags src/pages/index.astro src/pages/archive.astro src/styles/global.css
git commit -m "feat: add category and tag pages"
```

Expected: commit succeeds.

## Task 3: Article Table of Contents

**Files:**
- Create: `src/components/TableOfContents.astro`
- Modify: `src/pages/posts/[slug].astro`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create `src/components/TableOfContents.astro`**

Create `src/components/TableOfContents.astro` with this exact content:

```astro
---
interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface Props {
  headings: Heading[];
}

const headings = Astro.props.headings.filter((heading: Heading) => heading.depth >= 2 && heading.depth <= 3);
---

{headings.length > 0 && (
  <aside class="table-of-contents" aria-label="文章目录">
    <p class="eyebrow">Contents</p>
    <nav>
      {headings.map((heading) => (
        <a class={`toc-depth-${heading.depth}`} href={`#${heading.slug}`}>{heading.text}</a>
      ))}
    </nav>
  </aside>
)}
```

- [ ] **Step 2: Modify `src/pages/posts/[slug].astro`**

Replace the render line:

```astro
const { Content } = await post.render();
```

with:

```astro
const { Content, headings } = await post.render();
```

Add this prop to the `PostLayout` call:

```astro
  headings={headings}
```

- [ ] **Step 3: Modify `src/layouts/PostLayout.astro` imports and props**

At the top of `src/layouts/PostLayout.astro`, add this import:

```astro
import TableOfContents from "../components/TableOfContents.astro";
```

Extend the `Props` interface with this exact property:

```ts
  headings: { depth: number; slug: string; text: string }[];
```

Update the props destructuring to include `headings`:

```ts
const { title, description, pubDate, category, tags, headings } = Astro.props;
```

Inside `.article-content`, directly before `<slot />`, add:

```astro
<TableOfContents headings={headings} />
```

- [ ] **Step 4: Add TOC CSS**

Append this exact CSS to `src/styles/global.css`:

```css
.table-of-contents {
  margin: 2rem 0;
  padding: 1rem 1.2rem;
  border-left: 5px solid var(--sky);
  background: rgba(255, 250, 240, 0.72);
}

.table-of-contents nav {
  display: grid;
  gap: 0.45rem;
}

.table-of-contents a {
  color: var(--pine);
  font-weight: 900;
  text-decoration: none;
}

.table-of-contents .toc-depth-3 {
  padding-left: 1rem;
  color: var(--muted);
  font-size: 0.96rem;
}

.article-content h2,
.article-content h3 {
  scroll-margin-top: 6rem;
}
```

- [ ] **Step 5: Add headings to one sample post**

Modify `src/content/posts/build-notes.md` so the body contains these headings:

```markdown
## 为什么先选择静态站点

个人网站最重要的不是技术栈有多华丽，而是它能不能稳定地承载更新。

## 当前版本的取舍

这个版本选择了最朴素的静态页面：没有构建步骤，没有数据库，也没有复杂依赖。好处是部署简单、打开很快，日后迁移到框架也不会被早期选择绑住。

## 接下来可以长出的能力

接下来可以逐步增加归档页、RSS、文章搜索和自定义域名。每一步都应该服务于写作，而不是让维护网站本身变成新的负担。
```

- [ ] **Step 6: Run build**

Run:

```powershell
npm.cmd run build
```

Expected: command exits `0`, and `dist/posts/build-notes/index.html` contains `table-of-contents`.

- [ ] **Step 7: Commit table of contents**

Run:

```powershell
git add src/components/TableOfContents.astro src/pages/posts/[slug].astro src/layouts/PostLayout.astro src/styles/global.css src/content/posts/build-notes.md
git commit -m "feat: add article table of contents"
```

Expected: commit succeeds.

## Task 4: SEO and Share Metadata

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/pages/posts/[slug].astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/archive.astro`

- [ ] **Step 1: Modify `src/layouts/BaseLayout.astro` props**

Replace the `Props` interface in `src/layouts/BaseLayout.astro` with this exact interface:

```ts
interface Props {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  structuredData?: Record<string, unknown>;
}
```

Replace the props destructuring with:

```ts
const {
  title = "个人博客 | Notes & Fieldwork",
  description = "一个记录思考、项目和生活观察的个人博客。",
  image,
  type = "website",
  structuredData,
} = Astro.props;
```

Add these constants after `canonical`:

```ts
const imageUrl = image ? new URL(image, Astro.site).toString() : undefined;
```

- [ ] **Step 2: Add metadata tags in `BaseLayout.astro`**

In the `<head>`, replace:

```astro
<meta property="og:type" content="website" />
```

with this exact block:

```astro
<meta property="og:type" content={type} />
<meta property="og:url" content={canonical} />
{imageUrl && <meta property="og:image" content={imageUrl} />}
<meta name="twitter:card" content={imageUrl ? "summary_large_image" : "summary"} />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
{imageUrl && <meta name="twitter:image" content={imageUrl} />}
{structuredData && (
  <script type="application/ld+json" set:html={JSON.stringify(structuredData)} />
)}
```

- [ ] **Step 3: Modify `src/layouts/PostLayout.astro` props**

Extend the `Props` interface with:

```ts
  slug: string;
  image?: string;
```

Update props destructuring:

```ts
const { title, description, pubDate, category, tags, headings, slug, image } = Astro.props;
```

Add this structured data object before the template:

```ts
const structuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: title,
  description,
  datePublished: pubDate.toISOString(),
  author: {
    "@type": "Person",
    name: "Notes & Fieldwork",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": new URL(withBase(`posts/${slug}/`), Astro.site).toString(),
  },
  keywords: tags.join(", "),
};
```

Replace the `<BaseLayout ...>` opening tag with:

```astro
<BaseLayout
  title={`${title} | Notes & Fieldwork`}
  description={description}
  image={image}
  type="article"
  structuredData={structuredData}
>
```

- [ ] **Step 4: Modify `src/pages/posts/[slug].astro`**

Pass `slug` and `image` into `PostLayout`:

```astro
  slug={post.slug}
  image={post.data.image}
```

- [ ] **Step 5: Add website structured data to `src/pages/index.astro`**

Add this constant after `tags`:

```ts
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Notes & Fieldwork",
  description: "一个记录思考、项目和生活观察的个人博客。",
  url: new URL(withBase(), Astro.site).toString(),
};
```

Change `<BaseLayout>` to:

```astro
<BaseLayout structuredData={structuredData}>
```

- [ ] **Step 6: Add archive page structured data**

In `src/pages/archive.astro`, add this constant after posts:

```ts
const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "文章归档",
  description: "Notes & Fieldwork 的全部文章归档。",
  url: new URL(withBase("archive/"), Astro.site).toString(),
};
```

Change the archive `<BaseLayout ...>` opening tag to include:

```astro
structuredData={structuredData}
```

- [ ] **Step 7: Run build and inspect metadata**

Run:

```powershell
npm.cmd run build
```

Expected: command exits `0`.

Run:

```powershell
Select-String -Path dist\index.html,dist\posts\build-notes\index.html -Pattern 'application/ld\\+json|twitter:card|og:url|BlogPosting'
```

Expected: output includes matches for JSON-LD, Twitter card, `og:url`, and `BlogPosting`.

- [ ] **Step 8: Commit SEO metadata**

Run:

```powershell
git add src/layouts/BaseLayout.astro src/layouts/PostLayout.astro src/pages/posts/[slug].astro src/pages/index.astro src/pages/archive.astro
git commit -m "feat: add seo share metadata"
```

Expected: commit succeeds.

## Task 5: Documentation and Final Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add documentation to `README.md`**

Append this exact section to `README.md`:

````markdown
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
````

- [ ] **Step 2: Run full build**

Run:

```powershell
npm.cmd run build
```

Expected: command exits `0`.

- [ ] **Step 3: Verify core routes in generated output**

Run:

```powershell
Test-Path dist\index.html
Test-Path dist\archive\index.html
Test-Path dist\posts\build-notes\index.html
Test-Path dist\rss.xml
Test-Path dist\sitemap-index.xml
```

Expected: all commands print `True`.

- [ ] **Step 4: Verify generated taxonomy and metadata**

Run:

```powershell
Select-String -Path dist\index.html -Pattern '/GitHubWeb/tags/|/GitHubWeb/categories/'
Select-String -Path dist\posts\build-notes\index.html -Pattern 'table-of-contents|BlogPosting|twitter:card'
Select-String -Path dist\rss.xml -Pattern 'https://liyolo.github.io/GitHubWeb/posts/'
```

Expected: each command prints at least one match.

- [ ] **Step 5: Commit documentation**

Run:

```powershell
git add README.md
git commit -m "docs: explain taxonomy toc and seo"
```

Expected: commit succeeds.

- [ ] **Step 6: Push to GitHub**

Run:

```powershell
git push origin main
```

Expected: push succeeds and GitHub Actions starts a new Pages deployment.

## Self-Review

- Spec coverage: This plan covers category pages, tag pages, article table of contents, SEO share metadata, structured data, docs, build verification, and push.
- Placeholder scan: The plan contains concrete file paths, code blocks, commands, and expected outputs.
- Type consistency: Shared helpers consistently use `withBase`, `formatDate`, `categorySlug`, `tagSlug`, `getPublishedPosts`, and `BlogPost`.
