import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { install } from "../dist/installer.js";
import {
  ANTIGRAVITY_TEMPLATES,
  OPENCODE_TEMPLATES,
  getTemplates,
  isValidPlatform,
  resolveTemplateDir,
} from "../dist/templates.js";
import { parseArgs } from "../dist/cli.js";

test("OPENCODE_TEMPLATES defines all expected template entries", () => {
  assert.equal(OPENCODE_TEMPLATES.length, 6);

  const destPaths = OPENCODE_TEMPLATES.map((t) => t.destPath);
  assert.ok(destPaths.includes(".opencode/agents/orchestrator.md"));
  assert.ok(destPaths.includes(".opencode/agents/implementer.md"));
  assert.ok(destPaths.includes(".opencode/agents/reviewer.md"));
  assert.ok(destPaths.includes(".opencode/agents/tester.md"));
  assert.ok(destPaths.includes(".opencode/commands/cat-o.md"));
  assert.ok(destPaths.includes("opencode.json"));
});

test("ANTIGRAVITY_TEMPLATES defines all expected template entries", () => {
  assert.equal(ANTIGRAVITY_TEMPLATES.length, 5);

  const destPaths = ANTIGRAVITY_TEMPLATES.map((t) => t.destPath);
  assert.ok(destPaths.includes(".agents/rules/orchestrator.md"));
  assert.ok(destPaths.includes(".agents/rules/implementer.md"));
  assert.ok(destPaths.includes(".agents/rules/reviewer.md"));
  assert.ok(destPaths.includes(".agents/rules/tester.md"));
  assert.ok(destPaths.includes(".agents/skills/cat-o/SKILL.md"));
});

test("isValidPlatform validates supported platforms", () => {
  assert.equal(isValidPlatform("opencode"), true);
  assert.equal(isValidPlatform("antigravity"), true);
  assert.equal(isValidPlatform("cursor"), false);
  assert.equal(isValidPlatform(""), false);
  assert.equal(isValidPlatform(null), false);
  assert.equal(isValidPlatform(undefined), false);
});

test("getTemplates returns platform-specific templates", () => {
  assert.equal(getTemplates("opencode"), OPENCODE_TEMPLATES);
  assert.equal(getTemplates("antigravity"), ANTIGRAVITY_TEMPLATES);
  assert.equal(getTemplates(), OPENCODE_TEMPLATES);
});

test("resolveTemplateDir resolves existing directories for both platforms", async () => {
  const opencodeDir = await resolveTemplateDir("opencode");
  const opencodeStat = await fs.stat(opencodeDir);
  assert.ok(opencodeStat.isDirectory());

  const antigravityDir = await resolveTemplateDir("antigravity");
  const antigravityStat = await fs.stat(antigravityDir);
  assert.ok(antigravityStat.isDirectory());
});

test("install defaults to opencode when platform is not specified", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cat-test-default-"));

  try {
    const report = await install({ targetDir: tempDir });
    assert.equal(report.platform, "opencode");
    assert.equal(report.errors.length, 0);
    assert.equal(report.created, 6);

    const orchestratorPath = path.join(tempDir, ".opencode/agents/orchestrator.md");
    const stat = await fs.stat(orchestratorPath);
    assert.ok(stat.isFile());
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("install writes all templates safely into a clean target directory (OpenCode)", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cat-test-clean-"));

  try {
    const report = await install({ targetDir: tempDir, platform: "opencode" });

    assert.equal(report.errors.length, 0, `Expected no errors, got: ${report.errors.join(", ")}`);
    assert.equal(report.created, 6, "Expected exactly 6 created files");
    assert.equal(report.skipped, 0);
    assert.equal(report.overwritten, 0);

    for (const template of OPENCODE_TEMPLATES) {
      const fullPath = path.join(tempDir, template.destPath);
      const stat = await fs.stat(fullPath);
      assert.ok(stat.isFile(), `Expected file at ${fullPath}`);
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("install writes all templates safely into a clean target directory (Antigravity)", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cat-test-antigravity-clean-"));

  try {
    const report = await install({ targetDir: tempDir, platform: "antigravity" });

    assert.equal(report.errors.length, 0, `Expected no errors, got: ${report.errors.join(", ")}`);
    assert.equal(report.platform, "antigravity");
    assert.equal(report.created, 5, "Expected exactly 5 created files");
    assert.equal(report.skipped, 0);
    assert.equal(report.overwritten, 0);

    for (const template of ANTIGRAVITY_TEMPLATES) {
      const fullPath = path.join(tempDir, template.destPath);
      const stat = await fs.stat(fullPath);
      assert.ok(stat.isFile(), `Expected file at ${fullPath}`);
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("install preserves existing user files when --force is false (OpenCode)", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cat-test-safe-"));

  try {
    // Initial install
    const firstReport = await install({ targetDir: tempDir });
    assert.equal(firstReport.errors.length, 0);
    assert.equal(firstReport.created, 6);

    // User customizes their opencode.json
    const customConfig = JSON.stringify({ customKey: "user-preserved-value" }, null, 2);
    const configPath = path.join(tempDir, "opencode.json");
    await fs.writeFile(configPath, customConfig, "utf-8");

    // Second install without force
    const secondReport = await install({ targetDir: tempDir, force: false });
    assert.equal(secondReport.errors.length, 0);
    assert.equal(secondReport.created, 0);
    assert.equal(secondReport.overwritten, 0);
    assert.equal(secondReport.skipped, 6);

    // Verify user file was not overwritten
    const preservedContent = await fs.readFile(configPath, "utf-8");
    assert.equal(preservedContent, customConfig, "User file must be preserved without --force");
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("install preserves existing user files when --force is false (Antigravity)", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cat-test-ag-safe-"));

  try {
    // Initial install
    const firstReport = await install({ targetDir: tempDir, platform: "antigravity" });
    assert.equal(firstReport.errors.length, 0);
    assert.equal(firstReport.created, 5);

    // User customizes an existing rule
    const customRule = "# Custom User Guidelines";
    const rulePath = path.join(tempDir, ".agents/rules/orchestrator.md");
    await fs.writeFile(rulePath, customRule, "utf-8");

    // Second install without force
    const secondReport = await install({ targetDir: tempDir, platform: "antigravity", force: false });
    assert.equal(secondReport.errors.length, 0);
    assert.equal(secondReport.created, 0);
    assert.equal(secondReport.overwritten, 0);
    assert.equal(secondReport.skipped, 5);

    // Verify user file was not overwritten
    const preservedContent = await fs.readFile(rulePath, "utf-8");
    assert.equal(preservedContent, customRule, "User rule file must be preserved without --force");
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("install overwrites files when --force is true (Antigravity)", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cat-test-ag-force-"));

  try {
    // Initial install
    await install({ targetDir: tempDir, platform: "antigravity" });

    // User modifies file
    const customRule = "# Temporary Modification";
    const rulePath = path.join(tempDir, ".agents/rules/orchestrator.md");
    await fs.writeFile(rulePath, customRule, "utf-8");

    // Install with force
    const forceReport = await install({ targetDir: tempDir, platform: "antigravity", force: true });
    assert.equal(forceReport.errors.length, 0);
    assert.equal(forceReport.created, 0);
    assert.equal(forceReport.overwritten, 5);
    assert.equal(forceReport.skipped, 0);

    // Verify file was restored/overwritten with template content
    const overwrittenContent = await fs.readFile(rulePath, "utf-8");
    assert.notEqual(overwrittenContent, customRule);
    assert.ok(overwrittenContent.includes("CAT Orchestration Guidelines"));
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("install reports error when unsupported platform is provided", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cat-test-bad-plat-"));

  try {
    const report = await install({
      targetDir: tempDir,
      platform: "unknown-platform" as any,
    });

    assert.ok(report.errors.length > 0);
    assert.ok(report.errors[0]?.includes("Unsupported platform"));
    assert.equal(report.created, 0);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("install reports error when template directory is invalid", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cat-test-err-"));

  try {
    const report = await install({
      targetDir: tempDir,
      templateDir: path.join(tempDir, "non-existent-dir"),
    });

    assert.ok(report.errors.length > 0, "Expected errors for non-existent template directory");
    assert.equal(report.created, 0);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("install reports error when target path exists and is not a directory", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cat-test-notdir-"));
  const filePath = path.join(tempDir, "file.txt");
  await fs.writeFile(filePath, "hello", "utf-8");

  try {
    const report = await install({ targetDir: filePath });
    assert.ok(report.errors.length > 0, "Expected error when targetDir is a file");
    assert.ok(report.errors[0]?.includes("not a directory"));
    assert.equal(report.created, 0);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("parseArgs parses valid flags, target directory, and platform", () => {
  const result1 = parseArgs(["my-project", "--force", "-p", "antigravity"]);
  assert.equal(result1.options.force, true);
  assert.equal(result1.options.platform, "antigravity");
  assert.equal(result1.options.targetDir, path.resolve("my-project"));
  assert.equal(result1.showHelp, false);
  assert.equal(result1.showVersion, false);
  assert.equal(result1.error, undefined);

  const result2 = parseArgs(["--platform=opencode"]);
  assert.equal(result2.options.platform, "opencode");
  assert.equal(result2.error, undefined);

  const result3 = parseArgs(["-p=antigravity"]);
  assert.equal(result3.options.platform, "antigravity");
  assert.equal(result3.error, undefined);
});

test("parseArgs rejects invalid platform with clear error", () => {
  const result = parseArgs(["-p", "invalid-platform"]);
  assert.ok(result.error?.includes("Invalid platform"));
  assert.ok(result.error?.includes("Supported platforms: opencode, antigravity"));
});

test("parseArgs rejects missing platform argument", () => {
  const result = parseArgs(["-p"]);
  assert.ok(result.error?.includes("requires an argument"));
});

test("parseArgs rejects unknown options with a clear error", () => {
  const result = parseArgs(["--unknown-flag"]);
  assert.ok(result.error?.includes("Unknown option"));
});

test("parseArgs rejects multiple target directories as ambiguous", () => {
  const result = parseArgs(["dir1", "dir2"]);
  assert.ok(result.error?.includes("Unexpected argument"));
});

test("package includes both opencode and antigravity templates", async () => {
  const pkgContent = await fs.readFile(path.resolve("package.json"), "utf-8");
  const pkg = JSON.parse(pkgContent);
  assert.ok(pkg.files.includes("templates"), "templates folder must be included in package.json files");

  const opencodeDir = path.resolve("templates/opencode");
  const antigravityDir = path.resolve("templates/antigravity");

  const opencodeStat = await fs.stat(opencodeDir);
  assert.ok(opencodeStat.isDirectory());

  const antigravityStat = await fs.stat(antigravityDir);
  assert.ok(antigravityStat.isDirectory());
});


