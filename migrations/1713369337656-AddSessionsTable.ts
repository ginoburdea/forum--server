import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionsTable1713369337656 implements MigrationInterface {
    name = 'AddSessionsTable1713369337656';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "user_id" uuid, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "session" ADD CONSTRAINT "FK_30e98e8746699fb9af235410aff" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "session" DROP CONSTRAINT "FK_30e98e8746699fb9af235410aff"`,
        );
        await queryRunner.query(`DROP TABLE "session"`);
    }
}
