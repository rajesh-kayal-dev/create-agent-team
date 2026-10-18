#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { install } from "./installer.js";
import { isValidPlatform } from "./templates.js";
import type { InstallOptions, InstallReport, Platform } from "./types.js";

const VERSION = "0.1.0";

function printHelp(): void {
  console.log(`
create-agent-team (CAT) v${VERSION}

Usage:
  npx create-agent-team [target-directory] [options]

Arguments:
  target-directory                 Directory to install CAT configuration (default: current directory)

Options:
  -p, --platform <platform>        Target platform: opencode | antigravity (default: opencode)
  -f, --force                      Overwrite existing files if they conflict
  -h, --help                       Show this help message
  -v, --version                    Show version number

Workflows:
  OpenCode:
    1. Run 'npx create-agent-team' in your project root.
    2. Open your project in OpenCode.
    3. Run '/cat-o <task>' to delegate tasks through the CAT orchestrator.

  Antigravity:
    1. Run 'npx create-agent-team --platform antigravity' in your project root.
    2. Open your project in Antigravity.
    3. Use the '/cat-o' skill or ask the agent to coordinate tasks with CAT.
`);
}

export interface ParsedCli {
  options: InstallOptions;
  showHelp: boolean;
  showVersion: boolean;
  error?: string | undefined;
}

export function parseArgs(args: string[]): ParsedCli {
  let force = false;
  let showHelp = false;
  let showVersion = false;
  let targetDir: string | undefined;
  let platform: Platform | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;

    if (arg === "-h" || arg === "--help") {
      showHelp = true;
    } else if (arg === "-v" || arg === "--version") {
      showVersion = true;
    } else if (arg === "-f" || arg === "--force") {
      force = true;
    } else if (arg === "-p" || arg === "--platform") {
      const nextArg = args[++i];
      if (!nextArg || nextArg.startsWith("-")) {
        return {
          options: { force },
          showHelp: false,
          showVersion: false,
          error: `Option "${arg}" requires an argument (supported: opencode, antigravity).`,
        };
      }
      const normalized = nextArg.toLowerCase();
      if (!isValidPlatform(normalized)) {
        return {
          options: { force },
          showHelp: false,
          showVersion: false,
          error: `Invalid platform: "${nextArg}". Supported platforms: opencode, antigravity.`,
        };
      }
      platform = normalized;
    } else if (arg.startsWith("--platform=")) {
      const val = arg.slice("--platform=".length).toLowerCase();
      if (!isValidPlatform(val)) {
        return {
          options: { force },
          showHelp: false,
          showVersion: false,
          error: `Invalid platform: "${val}". Supported platforms: opencode, antigravity.`,
        };
      }
      platform = val;
    } else if (arg.startsWith("-p=")) {
      const val = arg.slice("-p=".length).toLowerCase();
      if (!isValidPlatform(val)) {
        return {
          options: { force },
          showHelp: false,
          showVersion: false,
          error: `Invalid platform: "${val}". Supported platforms: opencode, antigravity.`,
        };
      }
      platform = val;
    } else if (arg.startsWith("-")) {
      return {
        options: { force },
        showHelp: false,
        showVersion: false,
        error: `Unknown option: "${arg}". Use --help to view supported options.`,
      };
    } else if (!targetDir) {
      targetDir = arg;
    } else {
      return {
        options: { force },
        showHelp: false,
        showVersion: false,
        error: `Unexpected argument: "${arg}". Only one target directory may be specified.`,
      };
    }
  }

  return {
    options: {
      targetDir: targetDir ? path.resolve(targetDir) : undefined,
      platform,
      force,
    },
    showHelp,
    showVersion,
  };
}

async function promptForPlatform(): Promise<Platform> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await rl.question(
      "Select agent platform [1) opencode (default), 2) antigravity]: ",
    );
    const trimmed = answer.trim().toLowerCase();
    if (trimmed === "2" || trimmed === "antigravity") {
      return "antigravity";
    }
    return "opencode";
  } finally {
    rl.close();
  }
}

function printReport(report: InstallReport): void {
  console.log(`\nCAT Installation Summary:`);
  console.log(`Platform: ${report.platform}`);
  console.log(`Target: ${report.targetDir}\n`);

  for (const record of report.records) {
    if (record.status === "created") {
      console.log(`  + created      ${record.relativePath}`);
    } else if (record.status === "overwritten") {
      console.log(`  ! overwritten  ${record.relativePath}`);
    } else if (record.status === "skipped") {
      console.log(`  - skipped      ${record.relativePath} (${record.reason || "already exists"})`);
    }
  }

  console.log(`\nResults: ${report.created} created, ${report.overwritten} overwritten, ${report.skipped} skipped.`);

  if (report.errors.length > 0) {
    console.error(`\nErrors encountered:`);
    for (const error of report.errors) {
      console.error(`  x ${error}`);
    }
  } else if (report.created > 0 || report.overwritten > 0) {
    if (report.platform === "antigravity") {
      console.log(`\nSetup complete! You can now use '/cat-o' in Antigravity.`);
    } else {
      console.log(`\nSetup complete! You can now run '/cat-o <task>' in OpenCode.`);
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const { options, showHelp, showVersion, error } = parseArgs(args);

  if (error) {
    console.error(`Error: ${error}`);
    process.exitCode = 1;
    return;
  }

  if (showHelp) {
    printHelp();
    return;
  }

  if (showVersion) {
    console.log(`create-agent-team v${VERSION}`);
    return;
  }

  let selectedPlatform = options.platform;
  if (!selectedPlatform) {
    if (process.stdin.isTTY && process.stdout.isTTY) {
      selectedPlatform = await promptForPlatform();
    } else {
      selectedPlatform = "opencode";
    }
  }

  console.log(`Setting up CAT (Create Agent Team) for ${selectedPlatform}...`);
  const report = await install({ ...options, platform: selectedPlatform });
  printReport(report);

  if (report.errors.length > 0) {
    process.exitCode = 1;
  }
}

const isDirectExecution =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!).toLowerCase() === import.meta.filename.toLowerCase();

if (isDirectExecution) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Fatal error: ${message}`);
    process.exitCode = 1;
  });
}