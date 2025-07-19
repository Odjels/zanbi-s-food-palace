// src/menu/menu.module.ts
import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
//import { PrismaModule } from '../prisma/prisma.module'; // Adjust path as needed
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService], // Export service if needed in other modules
})
export class MenuModule {}
