# Create Many Products API — Design Spec

**Date:** 2026-06-05

## Overview

Add a bulk-create endpoint `POST /products/bulk` to the products module. Authenticated users (ERole.USER) can submit a list of products to be created atomically — all succeed or all fail. Returns `{ count: number }`.

## API

| Field    | Value                  |
|----------|------------------------|
| Method   | POST                   |
| Path     | /products/bulk         |
| Auth     | ERole.USER (JwtAuthGuard) |
| Response | `{ count: number }`    |

## DTOs

### Request — `CreateManyProductsDto`

```ts
// src/modules/products/dto/create-many-products.dto.ts
export class CreateManyProductsDto {
  @ApiProperty({ type: [CreateProductDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductDto)
  items: CreateProductDto[];
}
```

- `ArrayField` does not exist in this project — use raw `class-validator` + `class-transformer` decorators
- `items` must be a non-empty array of `CreateProductDto`
- Each item: `name` (required, 1–100 chars), `description` (optional), `price` (required, min 0)

### Response — `CreateManyProductsResponseDto`

```ts
// src/modules/products/dto/create-many-products.response.dto.ts
export class CreateManyProductsResponseDto {
  @ResField({ example: 5, description: 'Number of products created' })
  count: number;
}
```

## Repository

New method `createMany` in `ProductsRepository`:

```ts
async createMany(params: {
  data: Prisma.ProductCreateManyInput[];
}): Promise<Prisma.BatchPayload> {
  return this.prisma.$transaction(async (tx) => {
    return tx.product.createMany({ data: params.data });
  });
}
```

- Uses `prisma.$transaction` for atomicity
- Uses `createMany` for single-query bulk insert (performant)

## Service

New method `createMany` in `ProductsService`:

```ts
async createMany(items: CreateProductDto[], userId: number): Promise<{ count: number }> {
  return this.productsRepository.createMany({
    data: items.map((item) => ({ ...item, userId })),
  });
}
```

- Injects `userId` from `@CurrentUser()` — never trusted from request body

## Controller

New endpoint in `ProductsController`, placed before any parameterized routes:

```ts
@Roles(ERole.USER)
@UseGuards(JwtAuthGuard)
@UseInterceptors(new TransformInterceptor(CreateManyProductsResponseDto))
@Post('bulk')
@ApiOperation({ summary: 'Create many products' })
@ApiOkResponse({ type: CreateManyProductsResponseDto })
createManyProducts(
  @Body() dto: CreateManyProductsDto,
  @CurrentUser() currentUser: { id: string; role: ERole },
) {
  return this.productsService.createMany(dto.items, Number(currentUser.id));
}
```

> `POST /products/bulk` must be declared before `@Post()` (without param) to avoid routing conflicts.

## Error Handling

- Validation errors (empty array, invalid item fields) → 400 Bad Request from class-validator
- DB error → entire transaction rolls back → 500 Internal Server Error via global exception filter
- No partial success — atomic

## Files Changed

| File | Change |
|------|--------|
| `src/modules/products/dto/create-many-products.dto.ts` | New file |
| `src/modules/products/dto/create-many-products.response.dto.ts` | New file |
| `src/modules/products/products.repository.ts` | Add `createMany` method |
| `src/modules/products/products.service.ts` | Add `createMany` method |
| `src/modules/products/products.controller.ts` | Add `POST /bulk` endpoint |
