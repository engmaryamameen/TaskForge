import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailVerificationAndPasswordReset1778010000000
  implements MigrationInterface
{
  name = 'EmailVerificationAndPasswordReset1778010000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email_verified_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "email_verified_at" = "created_at" WHERE "is_email_verified" = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "is_email_verified"`,
    );

    await queryRunner.query(`
      CREATE TABLE "email_verification_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "used_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_verification_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_email_verification_token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "FK_email_verification_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_email_verification_user" ON "email_verification_tokens" ("user_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "used_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_password_reset_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_password_reset_token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "FK_password_reset_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_user" ON "password_reset_tokens" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
    await queryRunner.query(`DROP TABLE "email_verification_tokens"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "is_email_verified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "is_email_verified" = true WHERE "email_verified_at" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "email_verified_at"`,
    );
  }
}
