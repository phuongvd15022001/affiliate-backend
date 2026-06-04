# Code Style & Conventions

## File Naming

- kebab-case với dot-separator cho type: `products.service.ts`, `create-product.dto.ts`
- Guard: `jwt.guard.ts`, Strategy: `jwt.strategy.ts`, Repository: `products.repository.ts`
- Constants: `global.constants.ts`, Helpers: `auth.helpers.ts`, Decorators: `current-user.decorator.ts`

## Module Structure

Mỗi module trong `src/modules/<name>/` phải có đủ:

```
src/modules/<name>/
├── <name>.module.ts
├── <name>.controller.ts
├── <name>.service.ts
├── <name>.repository.ts     ← bắt buộc, không query Prisma trực tiếp trong service
└── dto/
    ├── create-<name>.dto.ts
    ├── update-<name>.dto.ts
    ├── get-list-<name>.dto.ts
    └── <name>.response.dto.ts
```

## Import Paths

- Dùng `src/` prefix, không dùng relative path `../../`:
  - ✅ `import { PrismaService } from 'src/services/prisma/prisma.service'`
  - ❌ `import { PrismaService } from '../../services/prisma/prisma.service'`

## DTO Conventions

### Request DTO — dùng custom decorators từ `src/shared/decorators/dto.decorators.ts`

```ts
import {
  StringField,
  NumberField,
  EmailField,
  EnumField,
} from 'src/shared/decorators/dto.decorators';

export class CreateProductDto {
  @StringField()
  name: string;

  @NumberField({ optional: true })
  price?: number;
}
```

Không dùng `@ApiProperty` + `@IsString` thủ công — dùng `StringField`, `NumberField`, `EmailField`, `IntField`, `BooleanField`, `EnumField`, `DateStringField`.

### List DTO — extend `BasePaginationDto`

```ts
import { BasePaginationDto } from 'src/shared/dtos/base-pagination.dto';

export class GetListProductsDto extends BasePaginationDto {}
```

### Response DTO — dùng `@ResField()`

```ts
import { ResField } from 'src/shared/decorators/dto.decorators';

export class ProductResponseDto {
  @ResField({ example: 1, description: 'Product ID' })
  id: number;
}
```

## Controller Conventions

- Luôn khai báo `@Roles()` + `@UseGuards(JwtAuthGuard)` + `@UseInterceptors(new TransformInterceptor(ResponseDto))` theo thứ tự đó
- `@Roles(ERole.PUBLIC)` cho endpoint không cần auth, `@Roles(ERole.USER)` / `@Roles(ERole.ADMIN)` cho endpoint cần auth
- Luôn có `@ApiTags`, `@ApiOperation`, `@ApiOkResponse` trên mỗi endpoint
- Dùng `@CurrentUser()` để lấy user hiện tại từ JWT token

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

- Repository chỉ chứa Prisma queries, không có business logic
- Nhận params dạng object: `{ whereUniqueInput, data, includes }` theo pattern hiện có
- Service gọi repository, không gọi `this.prisma` trực tiếp

## Shared Utilities

| Loại                           | Đặt ở                      |
| ------------------------------ | -------------------------- |
| Constants, enums               | `src/shared/constants/`    |
| Custom decorators              | `src/shared/decorators/`   |
| Base DTOs                      | `src/shared/dtos/`         |
| Helper functions               | `src/shared/helpers/`      |
| Interceptors                   | `src/shared/interceptors/` |
| Exception classes              | `src/exceptions/`          |
| Exception filters              | `src/filters/`             |
| Global services (Prisma, Mail) | `src/services/`            |
