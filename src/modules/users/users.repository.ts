import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    select?: Prisma.UserSelect;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy, select } = params;

    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select,
    });
  }

  async count(params: { where?: Prisma.UserWhereInput }): Promise<number> {
    const { where } = params;

    return this.prisma.user.count({ where });
  }

  async findOne(params: {
    whereUniqueInput: Prisma.UserWhereUniqueInput;
    includes?: Prisma.UserInclude;
  }): Promise<User | null> {
    const { whereUniqueInput, includes } = params;

    return this.prisma.user.findUnique({
      where: whereUniqueInput,
      include: includes,
    });
  }

  async create(params: { data: Prisma.UserCreateInput }): Promise<User> {
    const { data } = params;

    return this.prisma.user.create({
      data,
    });
  }

  async update(params: {
    whereUniqueInput: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUncheckedUpdateInput;
  }): Promise<User> {
    const { whereUniqueInput, data } = params;

    return this.prisma.user.update({
      data,
      where: whereUniqueInput,
    });
  }

  async delete(params: {
    whereUniqueInput: Prisma.UserWhereUniqueInput;
  }): Promise<User> {
    const { whereUniqueInput } = params;

    return this.prisma.user.delete({
      where: whereUniqueInput,
    });
  }

  async createWithTransaction(params: {
    transaction: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >;
    data: Prisma.UserUncheckedCreateInput;
  }): Promise<User> {
    const { transaction, data } = params;

    return transaction.user.create({
      data,
    });
  }

  async updateWithTransaction(params: {
    transaction: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >;
    whereUniqueInput: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUncheckedUpdateInput;
  }): Promise<User> {
    const { transaction, whereUniqueInput, data } = params;

    return transaction.user.update({
      data,
      where: whereUniqueInput,
    });
  }

  async deleteManyWithTransaction(params: {
    transaction: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >;
    where: Prisma.UserWhereInput;
  }) {
    const { transaction, where } = params;
    return transaction.user.deleteMany({
      where,
    });
  }

  async deleteWithTransaction(params: {
    transaction: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >;
    whereUniqueInput: Prisma.UserWhereUniqueInput;
  }): Promise<User> {
    const { transaction, whereUniqueInput } = params;
    return transaction.user.delete({
      where: whereUniqueInput,
    });
  }

  async createMany(params: {
    data: Prisma.UserUncheckedCreateInput[];
  }): Promise<{ count: number }> {
    const { data } = params;
    return this.prisma.$transaction((tx) => tx.user.createMany({ data }));
  }
}
