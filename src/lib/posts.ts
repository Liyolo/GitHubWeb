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
    slug: categorySlug(category),
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
      slug: tagSlug(name),
      posts: sortPostsNewestFirst(taggedPosts),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
};

const CATEGORY_SLUGS: Record<string, string> = {
  项目: "project",
  学习: "learning",
  生活: "life",
};

export const categorySlug = (category: string) => CATEGORY_SLUGS[category] ?? asciiSlug(category, "category");

export const tagSlug = (tag: string) => asciiSlug(tag, "tag");

const asciiSlug = (value: string, fallbackPrefix: string) => {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `${fallbackPrefix}-${hashSlug(value)}`;
};

const hashSlug = (value: string) => {
  let hash = 5381;

  for (const char of value) {
    hash = (hash * 33) ^ char.codePointAt(0)!;
  }

  return (hash >>> 0).toString(36);
};
