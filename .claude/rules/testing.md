# Testing Conventions

## Test Types

| Type      | File                 | Run                |
| --------- | -------------------- | ------------------ |
| Unit test | `src/**/*.spec.ts`   | `npm run test`     |
| E2E test  | `test/*.e2e-spec.ts` | `npm run test:e2e` |

## Unit Test — NestJS Testing Module

```ts
import { Test, TestingModule } from '@nestjs/testing';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: mockProductsRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });
});
```

- Mock external dependencies (repository, mail, prisma) — do not let unit tests hit the real database
- Place the test file next to the file under test: `products.service.spec.ts` next to `products.service.ts`

## E2E Test — Supertest

```ts
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Products (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /products', () => {
    return request(app.getHttpServer()).get('/products').expect(200);
  });
});
```

- Place E2E tests in the `test/` folder
- Filename: `<resource>.e2e-spec.ts`

## General Rules

- Write tests only when requested or when fixing a bug — do not add tests outside the scope
- Do not mock `PrismaService` in E2E — let tests hit the real test database
- Name describe/it blocks following the pattern: `describe('ClassName')` → `it('methodName - case')`
