# Create Agent Team (CAT)

A CLI package that makes it easy to set up and use AI coding-agent teams in any project.

## Goal

CAT aims to simplify working with multiple AI coding agents. Instead of manually creating agent definitions, commands, and configuration files, developers should be able to set up a working agent workflow with a single command.

## Expected Workflows

### OpenCode
1. Run `npx create-agent-team` inside your project root.
2. Open your project in OpenCode.
3. Invoke `/cat-o <task>` to delegate tasks through the CAT orchestrator.
4. The orchestrator analyzes the task and delegates work to suitable specialist agents (`implementer`, `tester`, `reviewer`).

### Antigravity
1. Run `npx create-agent-team --platform antigravity` inside your project root.
2. Open your project in Antigravity.
3. Use the `/cat-o` skill or prompt the agent to coordinate tasks with CAT.
4. The agent adopts the CAT orchestrator workflow and applies specialist guidelines from `.agents/rules/`.

## CLI Options

- `-p, --platform <opencode|antigravity>`: Select coding-agent platform (default: `opencode`).
- `-f, --force`: Overwrite existing configuration files.
- `-h, --help`: Display command help.
- `-v, --version`: Display version.

## Reference Repository

The `agents/` directory contains a cloned copy of the reference repository:

https://github.com/wshobson/agents

Analyze this repository to identify existing functionality that can be reused in CAT.

Do not assume that everything in the repository needs to be copied.

## Reuse Strategy

Identify reusable components such as:

- Agent definitions and orchestration workflows
- Commands and reusable skills
- OpenCode configuration and installation logic
- Code generation and validation utilities

For each component, explain whether it should be reused directly, adapted, or replaced with a simpler implementation.

## Implementation Principles

- Reuse working code instead of unnecessarily rewriting it.
- Keep the CLI simple and easy to use.
- Use TypeScript and native ESM for the CAT package where practical.
- Use OpenCode's native agent and command capabilities.
- Avoid building a custom AI orchestration engine.
- Preserve existing project configuration and avoid overwriting user files without permission.
- Keep the project structure clean and maintainable.
- Add tests for important functionality.

## Development Plan

### Phase 1: Repository Analysis
Analyze CAT and the reference repository.

Identify reusable components, dependencies, integration requirements, and unnecessary functionality.

Produce an implementation plan before modifying the code.

### Phase 2: Integration Plan
Determine how the selected components will fit into CAT's existing structure.

Keep the initial implementation focused on OpenCode.

### Phase 3: CLI Implementation
Implement the installation workflow and integrate the selected components.

### Phase 4: Verification
Test the CLI in a clean project and in a project that already contains OpenCode configuration.

Verify that `/cat-o` routes tasks through the orchestrator and that specialist delegation works as expected.

## Current Status

- TypeScript CLI foundation created.
- OpenCode orchestrator and command templates created.
- A reference repository has been cloned into `agents/`.
- Repository analysis and integration are pending.

## Important Instruction

Before implementing anything, analyze the existing CAT project and the reference repository.

Do not modify or copy large portions of the source code immediately.

First provide a concise report covering:

1. What can be reused.
2. Which files and dependencies are required.
3. What needs modification.
4. What should not be included.
5. The recommended integration plan.

Wait for approval before starting the integration.