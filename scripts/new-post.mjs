import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const VALID_CATEGORIES = new Set(["项目", "学习", "生活"]);
const DEFAULT_CATEGORY = "学习";
const DEFAULT_TAGS = ["写作"];
const USAGE = [
  '用法: npm run new-post -- "文章标题" [分类: 项目|学习|生活] [标签1] [标签2]',
  "提示: 传标签时请先填写分类；只传标题时默认分类“学习”、标签“写作”。",
].join("\n");

const [rawTitle, rawCategory = DEFAULT_CATEGORY, ...rawTags] = process.argv.slice(2);
const title = rawTitle?.trim();
const category = rawCategory.trim();
const tags = rawTags.map((tag) => tag.trim()).filter(Boolean);
const finalTags = tags.length > 0 ? tags : DEFAULT_TAGS;

if (!title) {
  console.error(USAGE);
  process.exit(1);
}

if (!VALID_CATEGORIES.has(category)) {
  console.error("分类必须是：项目、学习、生活。");
  console.error("如果要传标签，请先填写分类，再填写标签。");
  console.error(USAGE);
  process.exit(1);
}

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createSlug = (value, date) => {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const fallbackHash = createHash("sha256").update(value, "utf8").digest("hex").slice(0, 10);

  return slug || `post-${formatDate(date)}-${fallbackHash}`;
};

const quote = (value) => JSON.stringify(value);
const today = new Date();
const pubDate = formatDate(today);
const slug = createSlug(title, today);
const relativePath = path.join("src", "content", "posts", `${slug}.md`);
const filePath = path.join(process.cwd(), relativePath);

if (existsSync(filePath)) {
  console.error(`文章已存在：${relativePath}`);
  console.error("不会覆盖已有文章。");
  process.exit(1);
}

const content = `---
title: ${quote(title)}
description: "用一句话概括这篇文章。"
pubDate: ${pubDate}
category: ${quote(category)}
tags: [${finalTags.map(quote).join(", ")}]
featured: false
draft: true
---

## 开始写作

在这里写下第一段。
`;

await writeFile(filePath, content, { encoding: "utf8", flag: "wx" });

console.log(`已创建：${relativePath}`);
console.log('默认 draft: true，写完后改成 draft: false 或删除这一行再发布。');
