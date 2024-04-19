import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnswersTable1713459057864 implements MigrationInterface {
    name = 'AddAnswersTable1713459057864';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "answer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "text" character varying NOT NULL, "replying_to_id" uuid, "user_id" uuid NOT NULL, "question_id" uuid NOT NULL, CONSTRAINT "PK_9232db17b63fb1e94f97e5c224f" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "answer" ADD CONSTRAINT "FK_16c238eaddaacfcfbbf36626e7d" FOREIGN KEY ("replying_to_id") REFERENCES "answer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "answer" ADD CONSTRAINT "FK_add8ab72aec4ce5eb87fdc2740d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "answer" ADD CONSTRAINT "FK_c3d19a89541e4f0813f2fe09194" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "answer" DROP CONSTRAINT "FK_c3d19a89541e4f0813f2fe09194"`,
        );
        await queryRunner.query(
            `ALTER TABLE "answer" DROP CONSTRAINT "FK_add8ab72aec4ce5eb87fdc2740d"`,
        );
        await queryRunner.query(
            `ALTER TABLE "answer" DROP CONSTRAINT "FK_16c238eaddaacfcfbbf36626e7d"`,
        );
        await queryRunner.query(`DROP TABLE "answer"`);
    }
}
