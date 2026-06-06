import { readFile } from "node:fs/promises";
import path from "node:path";

export type ContactLink = {
  label: string;
  href: string;
};

export type SiteSettings = {
  contactLinks: ContactLink[];
};

const settingsPath = path.join(process.cwd(), "settings", "settings.json");

const readSettingsFile = async (filePath: string) => {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as SiteSettings;
};

const validateSettings = (settings: SiteSettings) => {
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
