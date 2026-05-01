import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBillingTables1776871250146 implements MigrationInterface {
    name = 'AddBillingTables1776871250146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "plans" ("id" character varying NOT NULL, "name" character varying NOT NULL, "price_monthly" integer NOT NULL DEFAULT '0', "max_members" integer NOT NULL, "max_projects" integer NOT NULL, "features" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "plan_id" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'active', "stripe_customer_id" character varying NOT NULL, "stripe_subscription_id" character varying, "current_period_start" TIMESTAMP, "current_period_end" TIMESTAMP, "grace_period_ends_at" TIMESTAMP, "cancel_at_period_end" boolean NOT NULL DEFAULT false, "entitlements_version" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9ea1509175fa294fc64d43a9fe6" UNIQUE ("organization_id"), CONSTRAINT "UQ_7aa77f6636d26cac1b731cac3ad" UNIQUE ("stripe_customer_id"), CONSTRAINT "UQ_3a2d09d943f39912a01831a9272" UNIQUE ("stripe_subscription_id"), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "processed_webhooks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stripe_event_id" character varying NOT NULL, "event_type" character varying NOT NULL, "processed_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b7b47fc9ac30de79e3129f63ea0" UNIQUE ("stripe_event_id"), CONSTRAINT "PK_424a5b387ca6f55edb0238218ec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b7b47fc9ac30de79e3129f63ea" ON "processed_webhooks" ("stripe_event_id") `);
        await queryRunner.query(`CREATE TABLE "organization_usage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "projects_count" integer NOT NULL DEFAULT '0', "members_count" integer NOT NULL DEFAULT '0', "tasks_count" integer NOT NULL DEFAULT '0', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b2e47b9a379b4299051bd8f4469" UNIQUE ("organization_id"), CONSTRAINT "PK_6385566de8e0f0e0b10e71fedc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_9ea1509175fa294fc64d43a9fe6" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_usage" ADD CONSTRAINT "FK_b2e47b9a379b4299051bd8f4469" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // Seed plans
        await queryRunner.query(`
            INSERT INTO "plans" ("id", "name", "price_monthly", "max_members", "max_projects", "features") VALUES
            ('free', 'Free', 0, 5, 3, '{"realtime": false, "advanced_reports": false}'),
            ('pro', 'Pro', 2900, 50, 50, '{"realtime": true, "advanced_reports": true}'),
            ('enterprise', 'Enterprise', 9900, 500, 500, '{"realtime": true, "advanced_reports": true}')
            ON CONFLICT ("id") DO UPDATE SET
                "name" = EXCLUDED."name",
                "price_monthly" = EXCLUDED."price_monthly",
                "max_members" = EXCLUDED."max_members",
                "max_projects" = EXCLUDED."max_projects",
                "features" = EXCLUDED."features"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_usage" DROP CONSTRAINT "FK_b2e47b9a379b4299051bd8f4469"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_9ea1509175fa294fc64d43a9fe6"`);
        await queryRunner.query(`DROP TABLE "organization_usage"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b7b47fc9ac30de79e3129f63ea"`);
        await queryRunner.query(`DROP TABLE "processed_webhooks"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TABLE "plans"`);
    }

}
