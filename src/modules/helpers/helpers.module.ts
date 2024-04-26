import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpersService } from './helpers.service';

@Module({
    imports: [TypeOrmModule.forFeature([])],
    controllers: [],
    providers: [HelpersService],
    exports: [TypeOrmModule, HelpersService],
})
export class HelpersModule {}
