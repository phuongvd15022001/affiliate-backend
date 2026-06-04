# nest-app-base

NestJS REST API with Prisma + PostgreSQL, JWT auth, file uploads, mail, and scheduled tasks.

## Skills

### NestJS Best Practices

`.agents/skills/nestjs-best-practices/SKILL.md`

Apply when writing, reviewing, or refactoring any NestJS code. 40 rules across 10 categories:

- **CRITICAL**: `arch-*` (feature modules, no circular deps, repository pattern), `di-*` (constructor injection, interface tokens)
- **HIGH**: `error-*` (exception filters, HTTP exceptions), `security-*` (JWT guards, class-validator, rate limiting), `perf-*` (caching, N+1 avoidance)
- **MEDIUM**: `db-*`, `api-*` (DTOs, interceptors, versioning), `test-*`, `devops-*`

Full rules: `.agents/skills/nestjs-best-practices/rules/`

### Prisma Postgres

`.agents/skills/prisma-postgres/SKILL.md`

Apply when working with Prisma schema, migrations, or database provisioning:

- Schema changes → always use migrations (`prisma migrate dev`)
- New database → `npx create-db@latest` or `prisma postgres link`
- Programmatic provisioning → `@prisma/management-api-sdk`

Full references: `.agents/skills/prisma-postgres/references/`

### Docker Patterns

`.agents/skills/docker-patterns/SKILL.md`

Apply when working with Docker or Docker Compose:

- Local dev setup → multi-stage Dockerfile, Compose with healthchecks, bind mounts + anonymous volume for `node_modules`
- Multi-service architecture → custom networks, service discovery by name, expose only necessary ports
- Security → non-root user, pinned image tags, secrets via env file (never hardcoded), `no-new-privileges`
- Anti-patterns: `:latest` tags, root user, data without volumes, secrets in `docker-compose.yml`

### Expo CI/CD Workflows

`.agents/skills/expo-cicd-workflows/SKILL.md`

Apply when writing or editing EAS workflow YAML files (`.eas/workflows/*.yml`):

- Always fetch the live JSON schema (`https://api.expo.dev/v2/workflows/schema`) before generating or validating — do not rely on memorized values
- Use `node .agents/skills/expo-cicd-workflows/scripts/fetch.js <url>` to fetch and cache schema/docs
- Validate output with `node .agents/skills/expo-cicd-workflows/scripts/validate.js <workflow.yml>`
- Top-level keys: `name`, `on`, `jobs` (required), `defaults`, `concurrency`
- Expressions use `${{ }}` syntax with contexts: `github.*`, `inputs.*`, `needs.*`, `steps.*`, `workflow.*`
