import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUsersDto } from './dto/create-users.dto';
import { GetListUsersDto } from './dto/get-list-users.dto';

const mockRepo = {
  findAll: jest.fn(),
  count: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createMany: jest.fn(),
};

const mockUser = {
  id: 1,
  email: 'alice@example.com',
  name: 'Alice',
  role: 'USER',
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.resetAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated users', async () => {
      mockRepo.findAll.mockResolvedValue([mockUser]);
      mockRepo.count.mockResolvedValue(1);

      const dto = Object.assign(new GetListUsersDto(), { page: 1, limit: 10 });
      await expect(
        service.findAll({ getListUsersDto: dto }),
      ).resolves.toBeDefined();

      expect(mockRepo.findAll).toHaveBeenCalled();
      expect(mockRepo.count).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when user does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('returns user when found', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.findOne(1)).resolves.toEqual(mockUser);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        whereUniqueInput: { id: 1 },
      });
    });
  });

  describe('create', () => {
    it('throws ConflictException when email already exists', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);

      const dto = Object.assign(new CreateUserDto(), {
        email: 'alice@example.com',
        name: 'Alice',
        password: '123456',
      });
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('creates user when email is new', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockUser);

      const dto = Object.assign(new CreateUserDto(), {
        email: 'alice@example.com',
        name: 'Alice',
        password: '123456',
      });
      await expect(service.create(dto)).resolves.toEqual(mockUser);
      expect(mockRepo.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('update', () => {
    it('throws ConflictException when email belongs to another user', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ ...mockUser, id: 2 })
        .mockResolvedValueOnce(mockUser);

      const dto = Object.assign(new UpdateUserDto(), {
        email: 'alice@example.com',
      });
      await expect(service.update(1, dto)).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);

      const dto = Object.assign(new UpdateUserDto(), {});
      await expect(service.update(999, dto)).rejects.toThrow(NotFoundException);
    });

    it('updates user when email belongs to the same user', async () => {
      const updated = { ...mockUser, name: 'Alice Updated' };
      mockRepo.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      mockRepo.update.mockResolvedValue(updated);

      const dto = Object.assign(new UpdateUserDto(), {
        email: 'alice@example.com',
        name: 'Alice Updated',
      });
      await expect(service.update(1, dto)).resolves.toEqual(updated);
    });

    it('updates user when no email change', async () => {
      const updated = { ...mockUser, name: 'Bob' };
      mockRepo.findOne.mockResolvedValueOnce(mockUser);
      mockRepo.update.mockResolvedValue(updated);

      const dto = Object.assign(new UpdateUserDto(), { name: 'Bob' });
      await expect(service.update(1, dto)).resolves.toEqual(updated);
      expect(mockRepo.update).toHaveBeenCalledWith({
        whereUniqueInput: { id: 1 },
        data: dto,
      });
    });
  });

  describe('refreshToken', () => {
    it('throws NotFoundException when user does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.refreshToken(999, 'token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates refreshToken for existing user', async () => {
      const updated = { ...mockUser, refreshToken: 'new-token' };
      mockRepo.findOne.mockResolvedValue(mockUser);
      mockRepo.update.mockResolvedValue(updated);

      await expect(service.refreshToken(1, 'new-token')).resolves.toEqual(
        updated,
      );
      expect(mockRepo.update).toHaveBeenCalledWith({
        whereUniqueInput: { id: 1 },
        data: { refreshToken: 'new-token' },
      });
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when user does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('deletes existing user and returns undefined', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);
      mockRepo.delete.mockResolvedValue(mockUser);

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(mockRepo.delete).toHaveBeenCalledWith({
        whereUniqueInput: { id: 1 },
      });
    });
  });

  describe('findOneByEmail', () => {
    it('throws NotFoundException when user does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOneByEmail('none@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns user when found by email', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);
      await expect(
        service.findOneByEmail('alice@example.com'),
      ).resolves.toEqual(mockUser);
    });
  });

  describe('createMany', () => {
    it('throws BadRequestException when duplicate emails in request', async () => {
      const dto = Object.assign(new CreateUsersDto(), {
        users: [
          Object.assign(new CreateUserDto(), {
            email: 'dup@example.com',
            name: 'A',
            password: '123456',
          }),
          Object.assign(new CreateUserDto(), {
            email: 'dup@example.com',
            name: 'B',
            password: '123456',
          }),
        ],
      });
      await expect(service.createMany(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws ConflictException when emails already exist in DB', async () => {
      mockRepo.findAll.mockResolvedValue([mockUser]);

      const dto = Object.assign(new CreateUsersDto(), {
        users: [
          Object.assign(new CreateUserDto(), {
            email: 'alice@example.com',
            name: 'Alice',
            password: '123456',
          }),
        ],
      });
      await expect(service.createMany(dto)).rejects.toThrow(ConflictException);
    });

    it('creates multiple users when all emails are new', async () => {
      mockRepo.findAll.mockResolvedValue([]);
      mockRepo.createMany.mockResolvedValue({ count: 2 });

      const users = [
        Object.assign(new CreateUserDto(), {
          email: 'a@example.com',
          name: 'A',
          password: '123456',
        }),
        Object.assign(new CreateUserDto(), {
          email: 'b@example.com',
          name: 'B',
          password: 'abcdef',
        }),
      ];
      const dto = Object.assign(new CreateUsersDto(), { users });

      await expect(service.createMany(dto)).resolves.toEqual({ count: 2 });
      expect(mockRepo.createMany).toHaveBeenCalledWith({ data: users });
    });
  });
});
