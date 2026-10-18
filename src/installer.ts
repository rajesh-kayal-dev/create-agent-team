import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  getTemplates,
  isValidPlatform,
  resolveTemplateDir,
} from "./templates.js";
import {
  SUPPORTED_PLATFORMS,
  type FileInstallRecord,
  type InstallOptions,
  type InstallReport,
  type InstallStatus,
  type Platform,
} from "./types.js";

/**
 * Checks if a destination path safely resides within the target directory,
 * preventing directory traversal attacks.
 */
function isSafeDestination(targetDir: string, destPath: string): boolean {
  const relative = path.relative(targetDir, destPath);
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

/**
 * Installs CAT configuration and templates into the target directory.
 */
export async function install(options: InstallOptions = {}): Promise<InstallReport> {
  const platform: Platform = options.platform ?? "opencode";
  const targetDir = path.resolve(options.targetDir ?? process.cwd());
  const force = options.force ?? false;

  const report: InstallReport = {
    targetDir,
    platform,
    records: [],
    created: 0,
    skipped: 0,
    overwritten: 0,
    errors: [],
  };

  if (!isValidPlatform(platform)) {
    report.errors.push(
      `Unsupported platform: "${String(platform)}". Supported platforms: ${SUPPORTED_PLATFORMS.join(", ")}`,
    );
    return report;
  }

  const templateDir = await resolveTemplateDir(platform, options.templateDir);

  try {
    const targetStat = await fs.stat(targetDir);
    if (!targetStat.isDirectory()) {
      report.errors.push(`Target path is not a directory: ${targetDir}`);
      return report;
    }
  } catch {
    // Target directory does not exist yet; will be created on file write
  }

  try {
    const stat = await fs.stat(templateDir);
    if (!stat.isDirectory()) {
      report.errors.push(`Template directory not found: ${templateDir}`);
      return report;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    report.errors.push(`Unable to access template directory: ${message}`);
    return report;
  }

  const templates = getTemplates(platform);

  for (const template of templates) {
    const sourceFilePath = path.join(templateDir, template.sourcePath);
    const destFilePath = path.resolve(targetDir, template.destPath);

    if (!isSafeDestination(targetDir, destFilePath)) {
      report.errors.push(`Security error: Target path outside project directory: ${template.destPath}`);
      continue;
    }

    try {
      let fileExists = false;
      try {
        await fs.access(destFilePath);
        fileExists = true;
      } catch {
        fileExists = false;
      }

      if (fileExists && !force) {
        report.records.push({
          relativePath: template.destPath,
          status: "skipped",
          reason: "File already exists (use --force to overwrite)",
        });
        report.skipped++;
        continue;
      }

      const content = await fs.readFile(sourceFilePath);
      await fs.mkdir(path.dirname(destFilePath), { recursive: true });
      await fs.writeFile(destFilePath, content);

      const status: InstallStatus = fileExists ? "overwritten" : "created";
      report.records.push({
        relativePath: template.destPath,
        status,
      });

      if (status === "created") {
        report.created++;
      } else {
        report.overwritten++;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.errors.push(`Failed to install ${template.destPath}: ${message}`);
    }
  }

  return report;
}
