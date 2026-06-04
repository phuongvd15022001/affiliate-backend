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
