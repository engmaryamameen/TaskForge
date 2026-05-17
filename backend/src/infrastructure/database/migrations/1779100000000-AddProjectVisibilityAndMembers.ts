import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectVisibilityAndMembers1779100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "projects"
      ADD COLUMN "visibility" varchar(20) NOT NULL DEFAULT 'public'
    `);

    await queryRunner.query(`
      CREATE TYPE "project_member_role_enum" AS ENUM ('manager', 'member', 'viewer')
    `);

    await queryRunner.query(`
      CREATE TABLE "project_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" "project_member_role_enum" NOT NULL DEFAULT 'member',
        "added_by" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_project_members" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_project_members_project_user" UNIQUE ("project_id", "user_id"),
        CONSTRAINT "FK_project_members_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_project_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_project_members_added_by" FOREIGN KEY ("added_by") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_project_members_project" ON "project_members" ("project_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_members_user" ON "project_members" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "project_members"`);
    await queryRunner.query(`DROP TYPE "project_member_role_enum"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "visibility"`);
  }
}
