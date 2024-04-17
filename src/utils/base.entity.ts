import {
    CreateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity as TypeormBaseEntity,
    UpdateDateColumn,
} from 'typeorm';

export class BaseEntity extends TypeormBaseEntity {
    @PrimaryGeneratedColumn('uuid') id: string;
    @UpdateDateColumn() updatedAt: Date;
    @CreateDateColumn() createdAt: Date;
}
