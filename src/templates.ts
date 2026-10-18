import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Platform, TemplateDefinition } from "./types.js";

/**
 * Curated list of OpenCode templates and their strictly controlled
 * source and destination relative paths.
 */
export const OPENCODE_TEMPLATES: readonly TemplateDefinition[] = [
  {
    sourcePath: "agents/orchestrator.md",
    destPath: ".opencode/agents/orchestrator.md",
  },
  {
    sourcePath: "agents/implementer.md",
    destPath: ".opencode/agents/implementer.md",
  },
  {
    sourcePath: "agents/reviewer.md",
    destPath: ".opencode/agents/reviewer.md",
  },
  {
    sourcePath: "agents/tester.md",
    destPath: ".opencode/agents/tester.md",
  },
  {
    sourcePath: "commands/cat-o.md",
    destPath: ".opencode/commands/cat-o.md",
  },
  {
    sourcePath: "opencode.json",
    destPath: "opencode.json",
  },
] as const;

/**
 * Curated list of Antigravity templates and their strictly controlled
 * source and destination relative paths.
 *
 * Workspace rules reside in .agents/rules/ and workspace skills in .agents/skills/.
 */
export const ANTIGRAVITY_TEMPLATES: readonly TemplateDefinition[] = [
  {
    sourcePath: "rules/orchestrator.md",
    destPath: ".agents/rules/orchestrator.md",
  },
  {
    sourcePath: "rules/implementer.md",
    destPath: ".agents/rules/implementer.md",
  },
  {
    sourcePath: "rules/reviewer.md",
    destPath: ".agents/rules/reviewer.md",
  },
  {
    sourcePath: "rules/tester.md",
    destPath: ".agents/rules/tester.md",
  },
  {
    sourcePath: "skills/cat-o/SKILL.md",
    destPath: ".agents/skills/cat-o/SKILL.md",
  },
] as const;

/**
 * Checks if a given string is a supported platform.
 */
export function isValidPlatform(platform: unknown): platform is Platform {
  return typeof platform === "string" && (platform === "opencode" || platform === "antigravity");
}

/**
 * Returns the template definitions for the requested platform.
 */
export function getTemplates(platform: Platform = "opencode"): readonly TemplateDefinition[] {
  if (platform === "antigravity") {
    return ANTIGRAVITY_TEMPLATES;
  }
  return OPENCODE_TEMPLATES;
}

/**
 * Resolves the directory containing the packaged templates for a platform.
 * Paths are resolved relative to this installed module, never process.cwd().
 */
export async function resolveTemplateDir(
  platformOrCustomDir: Platform | string = "opencode",
  customDir?: string,
): Promise<string> {
  let platform: Platform = "opencode";
  let explicitDir: string | undefined = customDir;

  if (platformOrCustomDir === "opencode" || platformOrCustomDir === "antigravity") {
    platform = platformOrCustomDir;
  } else {
    explicitDir = platformOrCustomDir;
  }

  if (explicitDir) {
    return path.resolve(explicitDir);
  }

  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const primaryCandidate = path.resolve(moduleDir, `../templates/${platform}`);

  try {
    const stat = await fs.stat(primaryCandidate);
    if (stat.isDirectory()) {
      return primaryCandidate;
    }
  } catch {
    // If primaryCandidate is missing, check fallbackCandidate
  }

  const fallbackCandidate = path.resolve(moduleDir, `../../templates/${platform}`);
  try {
    const fallbackStat = await fs.stat(fallbackCandidate);
    if (fallbackStat.isDirectory()) {
      return fallbackCandidate;
    }
  } catch {
    // Return primaryCandidate as the canonical path to report
  }

  return primaryCandidate;
}
