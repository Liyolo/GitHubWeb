import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPublishedPosts } from "../lib/posts";

const baseUrl = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const withBase = (path = "") => `${baseUrl}${path.replace(/^\/+/, "")}`;

export async function GET(context) {
  const posts = getPublishedPosts(await getCollection("posts"));
  const rssSite = new URL(baseUrl, context.site).toString();

  return rss({
    title: "Notes & Fieldwork",
    description: "一个记录思考、项目和生活观察的个人博客。",
    site: rssSite,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: withBase(`posts/${post.slug}/`),
      categories: [post.data.category, ...post.data.tags],
    })),
  });
}
