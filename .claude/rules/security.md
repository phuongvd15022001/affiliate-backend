# Security Rules

## Authentication & Authorization

- Every controller endpoint MUST declare `@Roles()` explicitly — never rely on a default.
- Use `@Roles(ERole.PUBLIC)` only for endpoints that truly require no identity (health check, login, register).
- Admin-only operations (`DELETE`, bulk actions, user management) MUST use `@Roles(ERole.ADMIN)`.
- Never trust the role from the request body or query — always read from `@CurrentUser()`.
- Guard order is fixed: `@Roles()` → `@UseGuards(JwtAuthGuard)` — reversing breaks role resolution.

## Response DTO — Never Expose Sensitive Fields

Response DTOs MUST NOT include:

```ts
// NEVER include these in any ResponseDto
password, passwordHash, hashedPassword
refreshToken, accessToken, token
secret, secretKey, apiKey
internalId, internalNote
deletedAt (unless explicitly needed)
```

Use `@ResField()` on every field in a ResponseDto — fields without `@ResField()` are excluded by `TransformInterceptor` automatically. Do not return raw Prisma model objects.

## Input Validation

- All request DTOs MUST use `StringField`, `NumberField`, `EmailField`, etc. from `src/shared/decorators/dto.decorators.ts` — these apply `class-validator` + sanitization automatically.
- Never pass `req.body` directly to a Prisma query — always go through a typed DTO.
- String fields used in search/filter: always trim and apply `MaxLength` to prevent oversized payloads.
- `@StringField({ optional: true })` does NOT mean untrusted — still validated when present.

## File Upload Security

- Allowed MIME types must be explicitly whitelisted — never accept `application/octet-stream` without validation.
- Set a maximum file size limit at the `MulterModule` level, not just in code.
- Store uploaded files by a generated UUID filename, never by the original `originalname`.
- Never execute or serve uploaded files from the same path without scanning.

## Secrets & Environment Variables

- Never hardcode secrets, tokens, or passwords in source code.
- Access config only through `ConfigService` — never `process.env.X` directly in business code.
- `.env` files must never be committed or logged — treat them as write-only at runtime.
- When writing tests, use dummy values for secrets (e.g., `'test-secret-key'`) — never real credentials.

## Database (Prisma)

- Never build raw SQL strings — use Prisma's typed query API only (`findUnique`, `create`, `update`, etc.).
- If raw query is unavoidable (`$queryRaw`), use tagged template literals — never string concatenation.
- Scope all queries to the authenticated user when applicable: `where: { id, userId: currentUser.id }`.
- Paginate all list queries — never return unbounded `findMany()` without `take`/`skip`.

## Error Handling

- Never return stack traces or internal error messages to the client.
- Use custom exception classes from `src/exceptions/` + global exception filter in `src/filters/`.
- HTTP 404 for "not found" resources, HTTP 403 for "forbidden" — do not expose which one is real when it's a security concern (e.g., user probing other users' resources).

## Logging

- Never log: passwords, tokens, full request bodies containing personal data, Prisma query results with user data.
- Log security-relevant events: failed login attempts, unauthorized access attempts, role escalation.
- Use log levels appropriately — `warn` for suspicious activity, `error` for system failures.

## HTTP Headers (Global)

- `helmet()` must be enabled in `main.ts` — provides CSP, X-Frame-Options, HSTS, etc.
- CORS: explicitly whitelist allowed origins via `ConfigService` — never use `origin: '*'` in production.
- Rate limiting must be applied globally via `ThrottlerModule` — override per-route only to tighten, not loosen.
