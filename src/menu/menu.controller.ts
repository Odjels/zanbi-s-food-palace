/* eslint-disable @typescript-eslint/no-unused-vars */
// src/menu/menu.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/menu.dto';
import { UpdateMenuDto } from './dto/menu.dto';
import { MenuFilterDto } from './dto/menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/role.enum';

@Controller('menu')
@UseGuards(JwtAuthGuard) // Uncomment when you have auth guards
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(@Body() createMenuDto: CreateMenuDto) {
    const menu = await this.menuService.create(createMenuDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Menu item created successfully',
      data: menu,
    };
  }

  @Get()
  async findAll(@Query() filterDto: MenuFilterDto) {
    const result = await this.menuService.findAll(filterDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Menu items retrieved successfully',
      ...result,
    };
  }

  @Get('categories')
  async getCategories() {
    const categories = await this.menuService.getCategories();
    return {
      statusCode: HttpStatus.OK,
      message: 'Categories retrieved successfully',
      data: categories,
    };
  }

  @Get('featured')
  async getFeaturedMenus(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 6;
    const menus = await this.menuService.getFeaturedMenus(parsedLimit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Featured menu items retrieved successfully',
      data: menus,
    };
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: string) {
    const menus = await this.menuService.findByCategory(category);
    return {
      statusCode: HttpStatus.OK,
      message: `Menu items for category '${category}' retrieved successfully`,
      data: menus,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const menu = await this.menuService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Menu item retrieved successfully',
      data: menu,
    };
  }

  @Patch(':id')
  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN, Role.MANAGER, Role.CHEF)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMenuDto: UpdateMenuDto) {
    const menu = await this.menuService.update(id, updateMenuDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Menu item updated successfully',
      data: menu,
    };
  }

  @Patch(':id/toggle-availability')
  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN, Role.MANAGER, Role.CHEF)
  async toggleAvailability(@Param('id', ParseUUIDPipe) id: string) {
    const menu = await this.menuService.toggleAvailability(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Menu item availability toggled successfully',
      data: menu,
    };
  }

  @Delete(':id')
  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN, Role.MANAGER)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const menu = await this.menuService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Menu item deleted successfully',
      data: menu,
    };
  }
}
