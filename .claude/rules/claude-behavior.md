# Claude Behavior Policy

### Commits & Git
- **Never commit unless explicitly asked.** Always wait for the user to say "commit" or "tạo commit".
- **Never push** to remote without explicit confirmation, even if asked to commit.
- **Never force push** to `main`/`master` under any circumstance.
- **Never use `--no-verify`** to skip pre-commit hooks. Fix the underlying issue instead.
- When staging files, add specific files by name — never `git add -A` or `git add .`.

### File Changes
- **Ask before deleting** any file, even if it looks unused.
- **Ask before overwriting** files that contain user-written code or config.
- Prefer editing existing files over creating new ones.
- Never create `*.md` documentation files unless explicitly requested.

### Code Generation
- Do not add features, refactoring, or abstractions beyond what was asked.
- Do not add comments that explain *what* the code does — only add comments when the *why* is non-obvious.
- Do not add error handling for scenarios that cannot happen.
- Always follow the NestJS best practices skill when generating or modifying code.

### Database
- Never run `prisma migrate reset` or any destructive DB command without explicit confirmation.
- Always use `prisma migrate dev` for schema changes, never edit the DB directly.

### Asking vs Doing
- For exploratory questions ("how should we approach X?"), give a 2–3 sentence recommendation and wait for approval before implementing.
- For ambiguous instructions, ask one clarifying question rather than guessing and doing the wrong thing.
- If a task would affect shared systems (push, deploy, send email), confirm before proceeding.
