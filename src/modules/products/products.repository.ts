import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    select?: Prisma.ProductSelect;
  }): Promise<Product[]> {
    const { skip, take, cursor, where, orderBy, select } = params;
    return this.prisma.product.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select,
    });
  }

  async count(params: { where?: Prisma.ProductWhereInput }): Promise<number> {
    return this.prisma.product.count({ where: params.where });
  }

  async findOne(params: {
    whereUniqueInput: Prisma.ProductWhereUniqueInput;
    includes?: Prisma.ProductInclude;
  }): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: params.whereUniqueInput,
      include: params.includes,
    });
  }

  async create(params: {
    data: Prisma.ProductUncheckedCreateInput;
  }): Promise<Product> {
    return this.prisma.product.create({ data: params.data });
  }

  async update(params: {
    whereUniqueInput: Prisma.ProductWhereUniqueInput;
    data: Prisma.ProductUncheckedUpdateInput;
  }): Promise<Product> {
    return this.prisma.product.update({
      data: params.data,
      where: params.whereUniqueInput,
    });
  }

  async delete(params: {
    whereUniqueInput: Prisma.ProductWhereUniqueInput;
  }): Promise<Product> {
    return this.prisma.product.delete({ where: params.whereUniqueInput });
  }

  async createMany(params: {
    data: Prisma.ProductCreateManyInput[];
  }): Promise<Prisma.BatchPayload> {
    return this.prisma.$transaction(async (tx) => {
      return tx.product.createMany({ data: params.data });
    });
  }
}
