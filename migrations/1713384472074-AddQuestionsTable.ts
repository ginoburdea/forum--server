import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuestionsTable1713384472074 implements MigrationInterface {
    name = 'AddQuestionsTable1713384472074'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "text" character varying NOT NULL, "closed_at" TIMESTAMP, "user_id" uuid, CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "FK_82c53e1db067ff3d6ef17dfd5c4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_82c53e1db067ff3d6ef17dfd5c4"`);
        await queryRunner.query(`DROP TABLE "question"`);
    }

}
