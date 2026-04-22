import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteAndFixIndexes1776763250545 implements MigrationInterface {
    name = 'AddSoftDeleteAndFixIndexes1776763250545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_707cfc415c7c12d38dfc2ec8eb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2699fb55b8a96b656e889e85b4"`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`CREATE INDEX "IDX_7a92e9e9d9aec6d97ba9792b9c" ON "tasks" ("organization_id", "due_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_0f6619f63f56f9fee0e777f12c" ON "tasks" ("organization_id", "project_id", "created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_0f6619f63f56f9fee0e777f12c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7a92e9e9d9aec6d97ba9792b9c"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`CREATE INDEX "IDX_2699fb55b8a96b656e889e85b4" ON "tasks" ("project_id", "organization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_707cfc415c7c12d38dfc2ec8eb" ON "tasks" ("due_date") `);
    }

}
