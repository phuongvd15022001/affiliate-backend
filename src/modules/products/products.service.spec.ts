import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { ERole } from 'src/shared/constants/global.constants';

const mockRepo = {
  findAll: jest.fn(),
  count: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('throws NotFoundException when product does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('returns product with user when found', async () => {
      const product = {
        id: 1,
        name: 'Chicken',
        price: 9.99,
        userId: 1,
        user: { id: 1, email: 'a@b.com', name: 'Alice' },
      };
      mockRepo.findOne.mockResolvedValue(product);
      await expect(service.findOne(1)).resolves.toEqual(product);
    });
  });

  describe('create', () => {
    it('creates product with the given userId', async () => {
      const dto = { name: 'Chicken', price: 9.99 };
      const created = { id: 1, ...dto, userId: 3, description: null };
      mockRepo.create.mockResolvedValue(created);
      const result = await service.create(dto as any, 3);
      expect(mockRepo.create).toHaveBeenCalledWith({
        data: { ...dto, userId: 3 },
      });
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when product does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(
        service.update(999, {}, { id: '1', role: ERole.USER }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not owner and not ADMIN', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, userId: 2 });
      await expect(
        service.update(1, {}, { id: '5', role: ERole.USER }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('updates when current user is the owner', async () => {
      const product = { id: 1, userId: 3 };
      const updated = { id: 1, name: 'Updated', userId: 3, price: 5 };
      mockRepo.findOne.mockResolvedValue(product);
      mockRepo.update.mockResolvedValue(updated);
      await expect(
        service.update(1, { name: 'Updated' }, { id: '3', role: ERole.USER }),
      ).resolves.toEqual(updated);
    });

    it('updates when current user is ADMIN regardless of ownership', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, userId: 2 });
      mockRepo.update.mockResolvedValue({
        id: 1,
        name: 'Updated',
        userId: 2,
        price: 5,
      });
      await expect(
        service.update(1, { name: 'Updated' }, { id: '99', role: ERole.ADMIN }),
      ).resolves.not.toThrow();
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when product does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(
        service.remove(999, { id: '1', role: ERole.USER }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not owner and not ADMIN', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, userId: 2 });
      await expect(
        service.remove(1, { id: '5', role: ERole.USER }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deletes when current user is the owner', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, userId: 3 });
      mockRepo.delete.mockResolvedValue({ id: 1 });
      await expect(
        service.remove(1, { id: '3', role: ERole.USER }),
      ).resolves.toBeUndefined();
      expect(mockRepo.delete).toHaveBeenCalledWith({
        whereUniqueInput: { id: 1 },
      });
    });

    it('deletes when current user is ADMIN regardless of ownership', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, userId: 2 });
      mockRepo.delete.mockResolvedValue({ id: 1 });
      await expect(
        service.remove(1, { id: '99', role: ERole.ADMIN }),
      ).resolves.toBeUndefined();
    });
  });
});
