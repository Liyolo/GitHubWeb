import { readFile } from "node:fs/promises";
import path from "node:path";

export type ContactLink = {
  label: string;
  href: string;
};

export type SiteSettings = {
  contactLinks: ContactLink[];
};

const localSettingsPath = path.join(process.cwd(), "settings", "settings.local.json");
const exampleSettingsPath = path.join(process.cwd(), "settings", "settings.example.json");

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
  try {
    return validateSettings(await readSettingsFile(localSettingsPath));
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT") {
      return validateSettings(await readSettingsFile(exampleSettingsPath));
    }

    throw error;
  }
};
