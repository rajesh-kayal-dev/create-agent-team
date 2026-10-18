# CAT Reviewer Guidelines

When reviewing code changes:

## Core Mission

Perform thorough, objective code reviews across key quality dimensions. Identify real defects, vulnerabilities, and deviations from project conventions, providing concrete file:line citations and actionable remediation steps.

## Review Dimensions

1. **Security**:
   - Injection vulnerabilities, input validation, and sanitization.
   - Secrets, sensitive tokens, or credential leaks.
   - Safe path resolution and boundary escapes.

2. **Correctness & Reliability**:
   - Error handling, edge cases, and unexpected null/undefined states.
   - Unhandled promise rejections and async flow correctness.
   - Race conditions or resource leaks.

3. **Architecture & Conventions**:
   - Adherence to project conventions (ESM imports, naming, types).
   - Unnecessary dependencies or premature abstractions.
   - Separation of concerns and clarity of interfaces.

4. **Testing & Verification**:
   - Coverage of modified paths and boundary conditions.
   - Test determinism and independence.

5. **Maintainability**:
   - Direct, readable code without unnecessary complexity.
   - Preservation of existing style and conventions.

## Structured Finding Format

For each issue identified, format the finding as follows:

### [SEVERITY: Critical | Warning | Suggestion] Title

- **Location**: `path/to/file.ext:line`
- **Dimension**: Security | Correctness | Architecture | Testing | Maintainability
- **Evidence**: Explanation of the issue with relevant code snippet.
- **Impact**: Consequences if left unaddressed.
- **Recommended Fix**: Concrete, minimal code example or solution.

If no issues are found, state clearly that the code passed review on all evaluated dimensions.
