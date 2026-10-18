# AGENTS.md

## Purpose

Build `create-agent-team` (CAT) as a small, reliable, maintainable Node.js CLI package. Code should reflect deliberate software engineering: solve the actual problem, follow the existing project conventions, and avoid unnecessary complexity.

CAT installs and configures an AI coding-agent workflow. It is **not** a custom AI orchestration engine.

## 1. Engineering Principles

- Understand the requirement and inspect the existing code before changing anything.
- Prefer the simplest complete solution that is easy to understand, test, and maintain.
- Reuse existing code and platform capabilities when appropriate; do not rewrite working code without a reason.
- Do not add features, abstractions, configuration options, or files that the requirement does not need.
- Do not assume that more code means better code. Every abstraction must have a clear purpose.
- Preserve existing behavior unless the task explicitly requires changing it.
- Follow established conventions in the repository instead of introducing a second style.
- Explain important trade-offs briefly when a decision is not obvious.
- Never claim that code, tests, builds, or commands succeeded unless they were actually run and succeeded.

## 2. Node.js and TypeScript

- Use modern Node.js and TypeScript features supported by the project's declared Node.js engine.
- Use native ECMAScript Modules (ESM): `import` and `export`.
- Keep `"type": "module"` in `package.json`.
- Do not introduce CommonJS (`require`, `module.exports`) unless a specific compatibility requirement justifies it.
- Use TypeScript for application source code. Avoid `any`; prefer accurate types and `unknown` where input is not yet validated.
- Keep strict TypeScript checks enabled. Do not weaken compiler settings merely to make an error disappear.
- Use explicit, meaningful names. Prefer small functions with one clear responsibility.
- Keep side effects visible. Separate CLI input/output from reusable logic where that separation makes the code easier to test.
- Follow the import conventions required by the current TypeScript `NodeNext` configuration, including emitted `.js` extensions for relative imports when required.
- Do not use experimental or obscure language features when a straightforward, supported approach is clearer.

## 3. Dependencies and Packages

- Before adding a dependency, first check whether Node.js, TypeScript, or an existing dependency already provides the required capability.
- Add a package only when it solves a real requirement and its maintenance, compatibility, license, and security posture are acceptable.
- Verify current package status, API usage, and version compatibility using official documentation or package metadata. Do not rely on memory for fast-changing package APIs.
- Prefer actively maintained packages with a clear purpose and minimal dependency footprint.
- Avoid duplicate libraries that solve the same problem.
- Do not add a dependency just to save a few clear lines of code.
- Keep runtime dependencies separate from development-only dependencies.
- Use the repository's existing package manager and lockfile. Do not mix npm, pnpm, and Yarn lockfiles.
- Do not update unrelated dependencies as part of a focused task.

## 4. Required Project Architecture and Folder Structure

Use this structure as the default architecture for CAT. Keep it consistent unless a documented requirement justifies a change.

```text
create-agent-team/
├── AGENTS.md
├── README.md
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── .gitignore
├── src/
│   ├── cli.ts
│   ├── installer.ts
│   ├── templates.ts
│   └── types.ts
├── templates/
│   └── opencode/
│       ├── opencode.json
│       ├── agents/
│       │   ├── orchestrator.md
│       │   ├── implementer.md
│       │   ├── reviewer.md
│       │   └── tester.md
│       └── commands/
│           └── cat-o.md
├── tests/
│   └── installer.test.ts
└── dist/                 # Generated build output; do not edit manually
```

### Module responsibilities

- `src/cli.ts`: the thin CLI entry point. Parse arguments, call application logic, display results, and set exit codes. Do not put installation algorithms here.
- `src/installer.ts`: resolve the target project, perform safe filesystem operations, install templates, and return a structured result. Keep terminal presentation out of this module.
- `src/templates.ts`: define the curated list of templates and their relative source/destination paths. Avoid duplicating the list across modules.
- `src/types.ts`: contain shared types only when multiple modules genuinely need them. Keep module-specific types close to their use.
- `templates/opencode/`: source-of-truth Markdown and JSON templates installed into a user's project.
- `tests/`: focused automated tests for observable behavior, especially installation safety.
- `dist/`: generated output only. Never edit generated files directly.

### Structure rules

- Keep modules organized by responsibility, not by generic architectural fashion.
- Do not add `utils/`, `helpers/`, `services/`, `core/`, `factories/`, or dependency-injection layers without a concrete need.
- Do not create one-file wrappers that merely forward calls to another module.
- Do not split a module only to make the folder tree look more sophisticated.
- Keep the CLI separate from reusable filesystem and installation logic so that the latter can be tested independently.
- Keep templates as real files rather than embedding long Markdown templates inside TypeScript strings.
- Ensure the build and npm package explicitly include the runtime templates. Never assume TypeScript copies Markdown or JSON files automatically.
- Resolve packaged template paths relative to the installed package/module, not the developer's current working directory.
- Keep the `agents/` reference checkout for development research only. Do not publish or install the entire reference repository as part of CAT.
- Update this structure only when real product requirements justify the change, and explain the reason in the implementation summary.

## 5. Code Quality and Maintainability

- Write code for the next developer who must understand and change it.
- Prefer direct, readable code over clever tricks, unnecessary generic abstractions, or deeply chained expressions.
- Avoid duplicated logic, but do not create a complex abstraction to remove trivial duplication.
- Validate external input at system boundaries, such as CLI arguments and filesystem paths.
- Handle expected errors with useful messages and an appropriate exit code.
- Do not silently swallow errors or use empty catch blocks.
- Avoid broad catch-and-continue behavior that can leave a partial installation looking successful.
- Use comments to explain intent, constraints, or non-obvious decisions, not to narrate each line.
- Do not add placeholder code, fake implementations, unnecessary TODOs, or decorative comments.
- Avoid hard-coded assumptions when the value can be derived safely from the project or configuration.
- Do not log secrets, environment variables, or sensitive file contents.

## 6. File-System and Installation Safety

- CAT must not overwrite a developer's existing files without explicit permission.
- Inspect the target path and handle existing files predictably.
- Make installation behavior clear: report which files were created, skipped, or could not be installed.
- Do not delete, rename, or modify unrelated project files.
- Resolve paths safely and avoid writing outside the intended project directory.
- Ensure repeated runs are safe and do not create duplicate or corrupted configuration.
- Keep the initial installer focused on project-local OpenCode files. Do not add global installation, multi-harness support, or complex migration logic unless explicitly required.
- Preserve user-owned configuration when adding CAT configuration.

## 7. Security and Trust Boundaries

- Treat command-line arguments, target paths, existing files, and project configuration as untrusted input.
- Resolve and normalize filesystem paths before writing. Verify that each destination remains inside the intended target project or the explicitly selected CAT output directory.
- Prevent path traversal from template paths or user-supplied arguments. Template destination paths must be controlled by CAT, not supplied as arbitrary paths by a template.
- Do not overwrite user-owned files by default. Make overwrite behavior explicit, limited to intended CAT-managed destinations, and clearly reported.
- Do not delete unrelated files, follow unexpected paths, or silently change existing configuration.
- Do not execute shell commands assembled from user input. If a subprocess is necessary, use a safe argument array and explain why the subprocess is needed.
- Do not use `eval` or dynamic code execution for argument parsing or configuration.
- Validate CLI options and reject unsupported or ambiguous arguments with a clear error.
- Use least privilege: request no more filesystem access or permissions than the task requires.
- Do not read, print, transmit, or store secrets such as tokens, passwords, private keys, or unrelated environment variables.
- Avoid network access during installation unless a clearly documented feature requires it. The basic installer should use packaged local templates.
- Handle filesystem errors explicitly. Do not report successful installation when some required files failed.
- Keep dependencies minimal and check their maintenance, compatibility, and security posture before adding them.
- Add tests for path traversal, existing-file conflicts, invalid destinations, and partial failures where relevant.
- Do not claim the installer is fully secure based only on code inspection; report the security checks and tests that were actually performed.

## 8. Testing and Verification

- Add tests for important behavior, especially file installation, existing-file conflicts, path handling, and error cases.
- Test observable behavior rather than implementation details.
- Include normal cases, edge cases, and failure cases where they matter.
- Keep tests deterministic and independent of external services whenever possible.
- Before finishing a change, run the relevant tests, type checks, and build commands available in the project.
- Fix failures caused by the change. Clearly report pre-existing failures or checks that could not be run.
- Do not add a testing framework until the project needs one; choose a maintained tool that works with the current Node.js and TypeScript setup.

## 9. npm CLI and Package Standards

- Keep the CLI entry point aligned with the `bin` entry in `package.json`.
- Ensure the built CLI has the required Node.js shebang and executable packaging behavior.
- Keep `package.json` metadata accurate, including description, license, supported Node.js version, scripts, and entry points.
- Ensure files required by published users are included in the npm package and development-only files are excluded where appropriate.
- Test the package locally before considering it ready to publish.
- Provide clear command help and actionable error messages as CLI features are added.
- Use meaningful, consistent exit codes for success and failure.
- Do not add interactive prompts or command-line options unless they improve a real user workflow.

## 10. CAT Product Boundaries

- Keep the first implementation focused on OpenCode.
- CAT installs templates and configuration; OpenCode performs agent reasoning and delegation.
- Prefer a small set of useful workflows over a large collection of commands.
- Keep `/cat-o` as the main task workflow. Add commands such as `/cat-review` only when their behavior is distinct and useful.
- Treat implementer, tester, and reviewer as specialist agents the orchestrator can delegate to when appropriate, not as mandatory steps for every task.
- Reuse or adapt only the reference-repository components that fit CAT. Do not copy the entire repository or its unrelated infrastructure.
- Adapt prompts and configuration to OpenCode's supported features. Do not assume another coding harness's tools or team APIs exist in OpenCode.
- Do not create agents unnecessarily. Prefer existing specialists and create project-specific agents only when the task genuinely requires them.
- Keep installation safe, understandable, and reversible where practical.

## 11. Required Workflow for Code Changes

1. Inspect the relevant files and understand the current behavior.
2. Identify the smallest appropriate change.
3. Check current official documentation when package APIs, Node.js behavior, or OpenCode capabilities may have changed.
4. Implement the change using the conventions in this file.
5. Add or update focused tests.
6. Run relevant tests, type checks, and build checks.
7. Review the diff for unnecessary code, dependencies, unrelated edits, security risks, and accidental file overwrites.
8. Summarize what changed, what was verified, and any remaining limitations.

If a requirement is unclear or a change could cause destructive behavior, ask before proceeding. Do not perform broad refactors when a focused change is sufficient.
