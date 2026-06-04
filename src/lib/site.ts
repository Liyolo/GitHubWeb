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
