/**
 * Shared types for CAT installation and templates.
 */

export type Platform = "opencode" | "antigravity";

export const SUPPORTED_PLATFORMS: readonly Platform[] = ["opencode", "antigravity"] as const;

export type InstallStatus = "created" | "skipped" | "overwritten";

export interface FileInstallRecord {
  relativePath: string;
  status: InstallStatus;
  reason?: string;
}

export interface InstallReport {
  targetDir: string;
  platform: Platform;
  records: FileInstallRecord[];
  created: number;
  skipped: number;
  overwritten: number;
  errors: string[];
}

export interface InstallOptions {
  targetDir?: string | undefined;
  templateDir?: string | undefined;
  platform?: Platform | undefined;
  force?: boolean | undefined;
}

export interface TemplateDefinition {
  /** Relative path within the templates source directory */
  sourcePath: string;
  /** Relative destination path within the target project */
  destPath: string;
}
