import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationsFieldsToUsersTable1713630268316
    implements MigrationInterface
{
    name = 'AddNotificationsFieldsToUsersTable1713630268316';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD "answers_notifications" boolean NOT NULL DEFAULT true`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD "replies_notifications" boolean NOT NULL DEFAULT true`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" DROP COLUMN "replies_notifications"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" DROP COLUMN "answers_notifications"`,
        );
    }
}
