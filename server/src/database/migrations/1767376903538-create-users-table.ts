import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1767376903538 implements MigrationInterface {
    name = 'CreateUsersTable1767376903538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('GUEST', 'CUSTOMER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying(150) NOT NULL, "hashed_password" character varying NOT NULL, "full_name" character varying(100) NOT NULL, "phone_number" character varying(15), "role" "public"."users_role_enum" NOT NULL DEFAULT 'CUSTOMER', "hashed_verify_token" character varying, "is_verified" boolean NOT NULL DEFAULT false, "hashed_refresh_token" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5bd6c253ff357b720673d7c65d" ON "users" ("hashed_verify_token") `);
        await queryRunner.query(`CREATE INDEX "IDX_c5efd7db748b536d6a8bfa8ffc" ON "users" ("email", "deleted_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c5efd7db748b536d6a8bfa8ffc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5bd6c253ff357b720673d7c65d"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
