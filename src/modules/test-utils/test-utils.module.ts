import { Module } from '@nestjs/common';
import { TestUtilsService } from './test-utils.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([])],
    providers: [TestUtilsService],
})
export class TestUtilsModule {}
