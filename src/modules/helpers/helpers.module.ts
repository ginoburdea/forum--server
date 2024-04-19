import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HasGuard } from './has.guard';
import { HelpersService } from './helpers.service';

@Module({
    imports: [TypeOrmModule.forFeature([])],
    controllers: [],
    providers: [HelpersService, HasGuard],
    exports: [TypeOrmModule, HelpersService, HasGuard],
})
export class HelpersModule {}
