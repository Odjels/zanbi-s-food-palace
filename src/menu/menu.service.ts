///* eslint-disable @typescript-eslint/no-unsafe-return */
///* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/menu/menu.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { CreateMenuDto } from './dto/menu.dto';
import { UpdateMenuDto } from './dto/menu.dto';
import { MenuFilterDto } from './dto/menu.dto';

import { Menu, Prisma } from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class MenuService {
  constructor(private readonly database: DatabaseService) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    try {
      const menu = await this.database.menu.create({
        data: createMenuDto,
      });
      return menu;
    } catch (error) {
      throw new BadRequestException('Failed to create menu item');
    }
  }

  async findAll(filterDto: MenuFilterDto) {
    const { category, available, minPrice, maxPrice, search, page = 1, limit = 10 } = filterDto;

    const skip = (page - 1) * limit;

    // Build where clause dynamically
    const where: Prisma.MenuWhereInput = {};

    if (category) {
      where.category = {
        equals: category,
        //mode: 'insensitive',
      };
    }

    if (available !== undefined) {
      where.available = available;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            //mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            //mode: 'insensitive',
          },
        },
      ];
    }

    const [menus, total] = await Promise.all([
      this.database.menu.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.database.menu.count({ where }),
    ]);

    return {
      data: menus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.database.menu.findUnique({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    // Check if menu exists
    await this.findOne(id);

    try {
      const updatedMenu = await this.database.menu.update({
        where: { id },
        data: updateMenuDto,
      });
      return updatedMenu;
    } catch (error) {
      throw new BadRequestException('Failed to update menu item');
    }
  }

  async remove(id: string): Promise<Menu> {
    // Check if menu exists
    await this.findOne(id);

    try {
      const deletedMenu = await this.database.menu.delete({
        where: { id },
      });
      return deletedMenu;
    } catch (error) {
      throw new BadRequestException('Failed to delete menu item');
    }
  }

  async findByCategory(category: string): Promise<Menu[]> {
    return this.database.menu.findMany({
      where: {
        category: {
          equals: category,
          //mode: 'insensitive',
        },
        available: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async toggleAvailability(id: string): Promise<Menu> {
    const menu = await this.findOne(id);

    return this.database.menu.update({
      where: { id },
      data: {
        available: !menu.available,
      },
    });
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.database.menu.findMany({
      select: {
        category: true,
      },
      where: {
        category: {
          not: null,
        },
      },
      distinct: ['category'],
    });

    return categories.map((item) => item.category).filter((category) => category !== null);
  }

  async getFeaturedMenus(limit: number = 6): Promise<Menu[]> {
    return this.database.menu.findMany({
      where: {
        available: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
