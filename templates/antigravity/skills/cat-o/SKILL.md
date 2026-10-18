---
name: cat-o
description: Coordinates an AI agent team (orchestrator, implementer, reviewer, tester) to plan, execute, review, and verify multi-step coding tasks.
---

# CAT Orchestrator Workflow

Follow this procedure when executing coding tasks with the CAT agent team.

## Team Roster & Rules

- **Orchestrator**: Coordinates tasks, decomposes work into file ownership boundaries, delegates to specialists, and verifies results. (See [.agents/rules/orchestrator.md](../../rules/orchestrator.md))
- **Implementer**: Specializes in minimal, focused code implementation and bug fixes within assigned file boundaries. (See [.agents/rules/implementer.md](../../rules/implementer.md))
- **Reviewer**: Performs multi-dimensional code reviews across Security, Correctness, Architecture, Testing, and Maintainability. (See [.agents/rules/reviewer.md](../../rules/reviewer.md))
- **Tester**: Authors automated tests, executes test suites, and verifies against regressions. (See [.agents/rules/tester.md](../../rules/tester.md))

## Orchestration Procedure

1. **Understand & Inspect**:
   - Inspect existing codebase conventions, build scripts, and tests before modifying files.
   - Do not make assumptions about environment or dependencies.

2. **Decompose & Establish File Ownership**:
   - For simple tasks: execute directly without unnecessary delegation.
   - For complex tasks: break into independent subtasks with strict, non-overlapping file ownership boundaries.

3. **Delegate & Execute**:
   - When using subagents or specialist steps, instruct them to adopt the specialist role persona (`implementer`, `tester`, `reviewer`).
   - Clearly specify the assigned files, interfaces, and acceptance criteria.

4. **Verify & Synthesize**:
   - Run type checks, builds, and test commands (`npm test`, `pnpm test`, etc.).
   - Never claim tests or builds succeeded without running them.
   - Address any reviewer findings or test failures before concluding.

5. **Report**:
   - Summarize files modified, tests executed, and any remaining limitations.
