# Code Style & Conventions

## File Naming

- kebab-case with dot-separator for type: `products.service.ts`, `create-product.dto.ts`
- Guard: `jwt.guard.ts`, Strategy: `jwt.strategy.ts`, Repository: `products.repository.ts`
- Constants: `global.constants.ts`, Helpers: `auth.helpers.ts`, Decorators: `current-user.decorator.ts`

## Module Structure

Each module in `src/modules/<name>/` must include:

```
src/modules/<name>/
├── <name>.module.ts
├── <name>.controller.ts
├── <name>.service.ts
├── <name>.repository.ts     ← required — no direct Prisma queries in service
└── dto/
    ├── create-<name>.dto.ts
    ├── update-<name>.dto.ts
    ├── get-list-<name>.dto.ts
    └── <name>.response.dto.ts
```

## Import Paths

- Use `src/` prefix, do not use relative paths like `../../`:
  - ✅ `import { PrismaService } from 'src/services/prisma/prisma.service'`
  - ❌ `import { PrismaService } from '../../services/prisma/prisma.service'`

## DTO Conventions

### Request DTO — use custom decorators from `src/shared/decorators/dto.decorators.ts`

- **Required** field: add `@ApiProperty({ description, example })` above the field decorator
- **Optional** field: add `@ApiPropertyOptional({ description, example })` above the field decorator

```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  StringField,
  NumberField,
  EmailField,
  EnumField,
} from 'src/shared/decorators/dto.decorators';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone', description: 'Product name' })
  @StringField()
  name: string;

  @ApiPropertyOptional({ example: 100, description: 'Product price' })
  @NumberField({ optional: true })
  price?: number;
}
```

Do not use `@ApiProperty` + `@IsString` manually as a replacement for field decorators — use `@ApiProperty`/`@ApiPropertyOptional` only to add `description`/`example` for Swagger; validation still uses `StringField`, `NumberField`, `EmailField`, `IntField`, `BooleanField`, `EnumField`, `DateStringField`.

### List DTO — extend `BasePaginationDto`

```ts
import { BasePaginationDto } from 'src/shared/dtos/base-pagination.dto';

export class GetListProductsDto extends BasePaginationDto {}
```

### Response DTO — use `@ResField()`

```ts
import { ResField } from 'src/shared/decorators/dto.decorators';

export class ProductResponseDto {
  @ResField({ example: 1, description: 'Product ID' })
  id: number;
}
```

## Controller Conventions

- Always declare `@Roles()` + `@UseGuards(JwtAuthGuard)` + `@UseInterceptors(new TransformInterceptor(ResponseDto))` in that order
- `@Roles(ERole.PUBLIC)` for endpoints that require no auth, `@Roles(ERole.USER)` / `@Roles(ERole.ADMIN)` for authenticated endpoints
- Always include `@ApiTags`, `@ApiOperation`, `@ApiOkResponse` on each endpoint
- Use `@CurrentUser()` to get the current user from the JWT token

```ts
@Roles(ERole.USER)
@UseGuards(JwtAuthGuard)
@UseInterceptors(new TransformInterceptor(ProductResponseDto))
@Post()
@ApiOperation({ summary: 'Create new product' })
@ApiOkResponse({ type: ProductResponseDto })
createProduct(@Body() dto: CreateProductDto, @CurrentUser() user: { id: string; role: ERole }) {}
```

## Repository Conventions

- Repository contains only Prisma queries, no business logic
- Accepts params as an object: `{ whereUniqueInput, data, includes }` following the existing pattern
- Service calls the repository, does not call `this.prisma` directly

## Shared Utilities

| Type                           | Location                   |
| ------------------------------ | -------------------------- |
| Constants, enums               | `src/shared/constants/`    |
| Custom decorators              | `src/shared/decorators/`   |
| Base DTOs                      | `src/shared/dtos/`         |
| Helper functions               | `src/shared/helpers/`      |
| Interceptors                   | `src/shared/interceptors/` |
| Exception classes              | `src/exceptions/`          |
| Exception filters              | `src/filters/`             |
| Global services (Prisma, Mail) | `src/services/`            |
