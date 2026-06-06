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
