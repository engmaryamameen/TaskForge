import { MigrationInterface, QueryRunner } from "typeorm";

export class IndexActivityTriggeredBy1776763432603 implements MigrationInterface {
    name = 'IndexActivityTriggeredBy1776763432603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_10f88cac55e8585505762c0139" ON "activities" ("triggered_by", "created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_10f88cac55e8585505762c0139"`);
    }

}
