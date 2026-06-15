# Create Many Products Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `POST /products/bulk` endpoint that atomically bulk-creates products and returns `{ count: number }`.

**Architecture:** Request DTO wraps an array of `CreateProductDto` items validated with `ValidateNested`. The service delegates to a new `createMany` repository method that wraps `prisma.product.createMany` in a `$transaction`. The controller injects `userId` from `@CurrentUser()` — never from the request body.

**Tech Stack:** NestJS, Prisma (`createMany` + `$transaction`), class-validator (`IsArray`, `ArrayMinSize`, `ValidateNested`), class-transformer (`Type`), Swagger (`@ApiProperty`)

---

## File Map

| Action | Path |
|--------|------|
| Create | `src/modules/products/dto/create-many-products.dto.ts` |
| Create | `src/modules/products/dto/create-many-products.response.dto.ts` |
| Modify | `src/modules/products/products.repository.ts` |
| Modify | `src/modules/products/products.service.ts` |
| Modify | `src/modules/products/products.service.spec.ts` |
| Modify | `src/modules/products/products.controller.ts` |

---

### Task 1: Create response DTO

**Files:**
- Create: `src/modules/products/dto/create-many-products.response.dto.ts`

- [ ] **Step 1: Create the file**

```ts
// src/modules/products/dto/create-many-products.response.dto.ts
import { ResField } from 'src/shared/decorators/dto.decorators';

export class CreateManyProductsResponseDto {
  @ResField({ example: 5, description: 'Number of products created' })
  count: number;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/products/dto/create-many-products.response.dto.ts
git commit -m "feat(products): add CreateManyProductsResponseDto"
```

---

### Task 2: Create request DTO

**Files:**
- Create: `src/modules/products/dto/create-many-products.dto.ts`

- [ ] **Step 1: Create the file**

```ts
// src/modules/products/dto/create-many-products.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class CreateManyProductsDto {
  @ApiProperty({ type: [CreateProductDto], description: 'List of products to create' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductDto)
  items: CreateProductDto[];
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/products/dto/create-many-products.dto.ts
git commit -m "feat(products): add CreateManyProductsDto"
```

---

### Task 3: Add `createMany` to repository

**Files:**
- Modify: `src/modules/products/products.repository.ts`

- [ ] **Step 1: Add the method at the end of `ProductsRepository` class, before the closing `}`**

```ts
async createMany(params: {
  data: Prisma.ProductCreateManyInput[];
}): Promise<Prisma.BatchPayload> {
  return this.prisma.$transaction(async (tx) => {
    return tx.product.createMany({ data: params.data });
  });
}
```

The full updated import block at the top stays the same — `Prisma` and `Product` are already imported from `@prisma/client`.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/products/products.repository.ts
git commit -m "feat(products): add createMany to ProductsRepository"
```

---

### Task 4: Add `createMany` to service — TDD

**Files:**
- Modify: `src/modules/products/products.service.ts`
- Modify: `src/modules/products/products.service.spec.ts`

- [ ] **Step 1: Add `createMany` to the mock repo in the spec file**

In `products.service.spec.ts`, update `mockRepo` to include `createMany`:

```ts
const mockRepo = {
  findAll: jest.fn(),
  count: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createMany: jest.fn(),   // <-- add this line
};
```

- [ ] **Step 2: Add the failing test**

In `products.service.spec.ts`, add a new `describe` block after the existing `describe('create', ...)` block:

```ts
describe('createMany', () => {
  it('calls repository with items mapped to include userId', async () => {
    const items: CreateProductDto[] = [
      { name: 'Milk', price: 1.5 },
      { name: 'Bread', price: 2.0 },
    ];
    mockRepo.createMany.mockResolvedValue({ count: 2 });

    const result = await service.createMany(items, 7);

    expect(mockRepo.createMany).toHaveBeenCalledWith({
      data: [
        { name: 'Milk', price: 1.5, userId: 7 },
        { name: 'Bread', price: 2.0, userId: 7 },
      ],
    });
    expect(result).toEqual({ count: 2 });
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
npx jest products.service.spec.ts --no-coverage
```

Expected: FAIL with `service.createMany is not a function`

- [ ] **Step 4: Add the method to the service**

In `products.service.ts`, add this method after the existing `create` method:

```ts
async createMany(
  items: CreateProductDto[],
  userId: number,
): Promise<{ count: number }> {
  return this.productsRepository.createMany({
    data: items.map((item) => ({ ...item, userId })),
  });
}
```

No new imports needed — `CreateProductDto` is already imported.

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx jest products.service.spec.ts --no-coverage
```

Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/modules/products/products.service.ts src/modules/products/products.service.spec.ts
git commit -m "feat(products): add createMany to ProductsService with tests"
```

---

### Task 5: Add `POST /products/bulk` endpoint to controller

**Files:**
- Modify: `src/modules/products/products.controller.ts`

- [ ] **Step 1: Add new imports to the controller**

In `products.controller.ts`, update the local imports block to include the two new DTOs:

```ts
import { CreateManyProductsDto } from './dto/create-many-products.dto';
import { CreateManyProductsResponseDto } from './dto/create-many-products.response.dto';
```

- [ ] **Step 2: Add the endpoint**

In `products.controller.ts`, add the following method **immediately before** the existing `createProduct` method (the one with `@Post()` and no path segment). This ensures `/bulk` is matched before NestJS tries to match an empty segment.

```ts
@Roles(ERole.USER)
@UseGuards(JwtAuthGuard)
@UseInterceptors(new TransformInterceptor(CreateManyProductsResponseDto))
@Post('bulk')
@ApiOperation({ summary: 'Create many products (atomic)' })
@ApiOkResponse({ type: CreateManyProductsResponseDto })
createManyProducts(
  @Body() dto: CreateManyProductsDto,
  @CurrentUser() currentUser: { id: string; role: ERole },
) {
  return this.productsService.createMany(dto.items, Number(currentUser.id));
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Run all unit tests**

```bash
npx jest --no-coverage
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/products/products.controller.ts
git commit -m "feat(products): add POST /products/bulk endpoint"
```

---

### Task 6: Manual smoke test

- [ ] **Step 1: Start the app**

```bash
npm run start:dev
```

Expected: app starts without errors, listening on the configured port (check `.env` for `PORT`, default 3000)

- [ ] **Step 2: Login to get a JWT token**

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"yourpassword"}' | jq .
```

Copy the `accessToken` from the response.

- [ ] **Step 3: Call the bulk endpoint**

```bash
curl -s -X POST http://localhost:3000/products/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "items": [
      { "name": "Product A", "price": 10 },
      { "name": "Product B", "price": 20, "description": "desc" }
    ]
  }' | jq .
```

Expected response:
```json
{ "count": 2 }
```

- [ ] **Step 4: Verify empty array is rejected**

```bash
curl -s -X POST http://localhost:3000/products/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{ "items": [] }' | jq .
```

Expected: `400 Bad Request`

- [ ] **Step 5: Verify unauthenticated call is rejected**

```bash
curl -s -X POST http://localhost:3000/products/bulk \
  -H "Content-Type: application/json" \
  -d '{ "items": [{ "name": "X", "price": 1 }] }' | jq .
```

Expected: `401 Unauthorized`
