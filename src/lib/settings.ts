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
const hrefPrefixes = ["http://", "https://", "mailto:", "/", "#"];

const readSettingsFile = async (filePath: string) => {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as unknown;
};

const assertString = (value: unknown, fieldName: string) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`settings.${fieldName} must be a non-empty string.`);
  }
};

const assertHref = (value: string, fieldName: string) => {
  if (!hrefPrefixes.some((prefix) => value.startsWith(prefix))) {
    throw new Error(
      `settings.${fieldName} must start with one of: ${hrefPrefixes.join(", ")}.`,
    );
  }
};

const assertRecord = (value: unknown, fieldName: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`settings.${fieldName} must be an object.`);
  }

  return value as Record<string, unknown>;
};

const validateSettings = (settings: unknown): SiteSettings => {
  const root = assertRecord(settings, "root");
  const site = assertRecord(root.site, "site");
  const home = assertRecord(root.home, "home");

  assertString(site.name, "site.name");
  assertString(site.title, "site.title");
  assertString(site.description, "site.description");
  assertString(site.author, "site.author");
  assertString(site.brandInitial, "site.brandInitial");
  assertString(site.footerText, "site.footerText");
  assertString(home.eyebrow, "home.eyebrow");
  assertString(home.heroTitle, "home.heroTitle");
  assertString(home.heroCopy, "home.heroCopy");
  assertString(home.aboutEyebrow, "home.aboutEyebrow");
  assertString(home.aboutTitle, "home.aboutTitle");
  assertString(home.aboutCopy, "home.aboutCopy");
  assertString(home.contactEyebrow, "home.contactEyebrow");
  assertString(home.contactTitle, "home.contactTitle");

  if (!Array.isArray(home.topics)) {
    throw new Error("settings.home.topics must be an array.");
  }

  for (const [index, topic] of home.topics.entries()) {
    assertString(topic, `home.topics[${index}]`);
  }

  if (!Array.isArray(root.contactLinks)) {
    throw new Error("settings.contactLinks must be an array.");
  }

  for (const [index, linkValue] of root.contactLinks.entries()) {
    const link = assertRecord(linkValue, `contactLinks[${index}]`);

    assertString(link.label, `contactLinks[${index}].label`);
    assertString(link.href, `contactLinks[${index}].href`);
    assertHref(link.href as string, `contactLinks[${index}].href`);
  }

  return settings as SiteSettings;
};

export const getSiteSettings = async () => {
  try {
    return validateSettings(await readSettingsFile(settingsPath));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load settings/settings.json: ${message}`);
  }
};
