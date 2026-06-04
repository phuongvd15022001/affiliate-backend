# Testing Conventions

## Test Types

| Loại      | File                 | Chạy               |
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

- Mock external dependencies (repository, mail, prisma) — không để unit test hit database thật
- Test file đặt cạnh file cần test: `products.service.spec.ts` bên cạnh `products.service.ts`

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

- E2E test đặt trong `test/` folder
- Filename: `<resource>.e2e-spec.ts`

## Quy tắc chung

- Viết test khi được yêu cầu hoặc khi fix bug — không tự thêm test ngoài scope
- Không mock `PrismaService` trong E2E — để test hit database test thật
- Đặt tên describe/it theo pattern: `describe('ClassName')` → `it('methodName - case')`
