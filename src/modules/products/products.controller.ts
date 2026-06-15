import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { Roles } from 'src/auth/auth.roles.decorator';
import { ERole } from 'src/shared/constants/global.constants';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { BasePaginationResponseDto } from 'src/shared/dtos/base-pagination.response.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { ProductsService } from './products.service';
import {
  ProductResponseDto,
  ProductWithUserResponseDto,
} from './dto/product.response.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetListProductsDto } from './dto/get-list-products.dto';
import { CreateManyProductsDto } from './dto/create-many-products.dto';
import { CreateManyProductsResponseDto } from './dto/create-many-products.response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(ERole.PUBLIC)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(ProductResponseDto))
  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiOkResponse({
    type: BasePaginationResponseDto.apiOKResponse(ProductResponseDto),
  })
  findAll(@Query() getListProductsDto: GetListProductsDto) {
    return this.productsService.findAll({ getListProductsDto });
  }

  @Roles(ERole.PUBLIC)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(ProductWithUserResponseDto))
  @Get(':id')
  @ApiOperation({ summary: 'Get product detail' })
  @ApiOkResponse({ type: ProductWithUserResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

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

  @Roles(ERole.USER)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(ProductResponseDto))
  @Post()
  @ApiOperation({ summary: 'Create new product' })
  @ApiOkResponse({ type: ProductResponseDto })
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() currentUser: { id: string; role: ERole },
  ) {
    return this.productsService.create(
      createProductDto,
      Number(currentUser.id),
    );
  }

  @Roles(ERole.USER)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new TransformInterceptor(ProductResponseDto))
  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiOkResponse({ type: ProductResponseDto })
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() currentUser: { id: string; role: ERole },
  ) {
    return this.productsService.update(id, updateProductDto, currentUser);
  }

  @Roles(ERole.USER)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete product' })
  removeProduct(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: { id: string; role: ERole },
  ) {
    return this.productsService.remove(id, currentUser);
  }
}
