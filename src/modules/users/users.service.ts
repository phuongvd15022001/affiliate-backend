import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetListUsersDto } from './dto/get-list-users.dto';
import { CommonHelpers } from 'src/shared/helpers/common.helpers';
import { UsersRepository } from './users.repository';
import { BasePaginationResponseDto } from 'src/shared/dtos/base-pagination.response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CreateUsersDto } from './dto/create-users.dto';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private prisma: PrismaService,
  ) {}

  async findAll(params: { getListUsersDto: GetListUsersDto }) {
    const { getListUsersDto } = params;
    const { take, skip, sortByField } = CommonHelpers.transformPaginationQuery(
      getListUsersDto,
      Prisma.UserScalarFieldEnum,
    );

    const where: Prisma.UserWhereInput = {
      name: {
        contains: getListUsersDto.search,
        mode: Prisma.QueryMode.insensitive,
      },
    };

    const [users, total] = await Promise.all([
      this.usersRepository.findAll({ take, skip, orderBy: sortByField, where }),
      this.usersRepository.count({ where }),
    ]);

    return BasePaginationResponseDto.convertToPaginationResponse(
      [users, users.length],
      getListUsersDto.page,
      total,
    );
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      whereUniqueInput: {
        id,
      },
      includes: {
        Product: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const checkExistEmail = await this.usersRepository.findOne({
      whereUniqueInput: {
        email: createUserDto.email,
      },
    });

    if (checkExistEmail) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersRepository.create({ data: createUserDto });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.email) {
      const checkExistEmail = await this.usersRepository.findOne({
        whereUniqueInput: {
          email: updateUserDto.email,
        },
      });

      if (checkExistEmail && checkExistEmail.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const checkExistUser = await this.usersRepository.findOne({
      whereUniqueInput: { id },
    });

    if (!checkExistUser) {
      throw new NotFoundException('User not found');
    }

    const user = await this.usersRepository.update({
      whereUniqueInput: {
        id,
      },
      data: updateUserDto,
    });

    return user;
  }

  async refreshToken(id: number, refreshToken: string) {
    const checkExistUser = await this.usersRepository.findOne({
      whereUniqueInput: { id },
    });

    if (!checkExistUser) {
      throw new NotFoundException('User not found');
    }

    const user = await this.usersRepository.update({
      whereUniqueInput: {
        id,
      },
      data: {
        refreshToken,
      },
    });

    return user;
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({
      whereUniqueInput: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersRepository.delete({ whereUniqueInput: { id } });
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      whereUniqueInput: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createMany(createUsersDto: CreateUsersDto) {
    const result = await this.prisma.$transaction((transaction) =>
      this.usersRepository.createManyWithTransaction({
        data: createUsersDto.users,
        transaction,
      }),
    );

    return result.count;
  }
}
