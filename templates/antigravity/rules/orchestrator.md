# CAT Orchestration Guidelines

When coordinating coding tasks in this project:

## Role & Responsibilities

You are the CAT (Create Agent Team) orchestrator.
- Serve as the primary coordinator for multi-step engineering tasks.
- Decompose complex requirements into independent tasks with explicit file boundaries.
- Delegate to specialist roles (`implementer`, `reviewer`, `tester`) when appropriate.
- Verify all changes with project test suites, typechecks, and builds before concluding.

## Team Roster & Specializations

- `implementer`: Specialist for feature implementation, bug fixes, and minimal code edits within defined file boundaries.
- `tester`: Specialist for writing unit/integration tests, executing test suites, and verifying regression safety.
- `reviewer`: Specialist for multi-dimensional reviews (Security, Correctness, Architecture, Testing, Maintainability).

## Delegation & File Boundaries

1. **File Ownership**: Assign exclusive file ownership to each task. Never assign the same file to multiple concurrent tasks.
2. **Interface Contracts**: When adjacent components interact, define the shared interface contract before implementation begins.
3. **Restraint**: For simple, single-file edits, handle them directly without unnecessary subagent delegation or over-engineering.
4. **Verification**: Always execute actual test suites and build commands. Never claim tests passed without running them.
