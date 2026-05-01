import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProjectsTasksActivities1776762803865 implements MigrationInterface {
    name = 'AddProjectsTasksActivities1776762803865'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying NOT NULL, "description" text, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ad0fe19546a13472d0d6804fd2" ON "projects" ("organization_id", "created_at") `);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "status" character varying NOT NULL DEFAULT 'todo', "priority" character varying NOT NULL DEFAULT 'medium', "assigned_to" uuid, "due_date" date, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_707cfc415c7c12d38dfc2ec8eb" ON "tasks" ("due_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_cac7be087f999633319b1e0e64" ON "tasks" ("organization_id", "assigned_to") `);
        await queryRunner.query(`CREATE INDEX "IDX_6394aff358077869d2e60ee08e" ON "tasks" ("organization_id", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_2699fb55b8a96b656e889e85b4" ON "tasks" ("organization_id", "project_id") `);
        await queryRunner.query(`CREATE TABLE "activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "event_type" character varying NOT NULL, "entity_type" character varying NOT NULL, "entity_id" uuid NOT NULL, "payload" jsonb NOT NULL DEFAULT '{}', "triggered_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c7132d2c0cab3480d1ba98732b" ON "activities" ("organization_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_585c8ce06628c70b70100bfb842" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_8a7ccdb94bcc8635f933c8f8080" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_9eecdb5b1ed8c7c2a1b392c28d4" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_44a9b5209cdfd6f72fb09a7c994" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_5770b28d72ca90c43b1381bf787" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_9fc727aef9e222ebd09dc8dac08" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_98a034f3603f95ab549c4259147" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_c3f124f559abb2845d0f6b6fded" FOREIGN KEY ("triggered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_c3f124f559abb2845d0f6b6fded"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_98a034f3603f95ab549c4259147"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_9fc727aef9e222ebd09dc8dac08"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_5770b28d72ca90c43b1381bf787"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_44a9b5209cdfd6f72fb09a7c994"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_9eecdb5b1ed8c7c2a1b392c28d4"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_8a7ccdb94bcc8635f933c8f8080"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_585c8ce06628c70b70100bfb842"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c7132d2c0cab3480d1ba98732b"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2699fb55b8a96b656e889e85b4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6394aff358077869d2e60ee08e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cac7be087f999633319b1e0e64"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_707cfc415c7c12d38dfc2ec8eb"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ad0fe19546a13472d0d6804fd2"`);
        await queryRunner.query(`DROP TABLE "projects"`);
    }

}
