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
