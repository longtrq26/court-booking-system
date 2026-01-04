import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCourtAndBookingTablesFinal1767547049971 implements MigrationInterface {
    name = 'CreateCourtAndBookingTablesFinal1767547049971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."courts_type_enum" AS ENUM('BADMINTON', 'FOOTBALL', 'TENNIS', 'PICKLEBALL')`);
        await queryRunner.query(`CREATE TABLE "courts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "location" character varying NOT NULL, "description" text, "type" "public"."courts_type_enum" NOT NULL DEFAULT 'FOOTBALL', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_948a5d356c3083f3237ecbf9897" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cf72e44ffba3179344b32cf917" ON "courts" ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_42ada86075cec1699abab27c34" ON "courts" ("type", "is_active", "deleted_at") `);
        await queryRunner.query(`CREATE TYPE "public"."court_prices_days_of_week_enum" AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')`);
        await queryRunner.query(`CREATE TABLE "court_prices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "court_id" uuid NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "price" numeric(10,2) NOT NULL, "priority" integer NOT NULL DEFAULT '0', "days_of_week" "public"."court_prices_days_of_week_enum" array NOT NULL DEFAULT '{}', "note" text, CONSTRAINT "PK_fcdcf3c6ffae5e79c65a0fcec80" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0a58ff7d7034c22d0b804d75c5" ON "court_prices" ("court_id", "priority") `);
        await queryRunner.query(`CREATE INDEX "IDX_34ae42c7f7d0e7e4fb11e4c9b2" ON "court_prices" ("court_id") `);
        await queryRunner.query(`CREATE TYPE "public"."booking_items_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'DECLINED')`);
        await queryRunner.query(`CREATE TABLE "booking_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "booking_id" uuid NOT NULL, "court_id" uuid NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "ref_date" date NOT NULL, "price" numeric(10,2) NOT NULL, "status" "public"."booking_items_status_enum" NOT NULL DEFAULT 'PENDING', CONSTRAINT "PK_53d863efb388346f9bee6ec6701" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_35b603cd86f0632dfd62a643cf" ON "booking_items" ("court_id", "ref_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_daaae66cf4a27bf05d2530ef8f" ON "booking_items" ("court_id", "start_time", "end_time") `);
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'DECLINED')`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_payment_status_enum" AS ENUM('PENDING', 'PAID', 'REFUNDED', 'FAILED')`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_booking_type_enum" AS ENUM('SINGLE', 'FIXED')`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "total_price" numeric(15,2) NOT NULL DEFAULT '0', "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'PENDING', "payment_status" "public"."bookings_payment_status_enum" NOT NULL DEFAULT 'PENDING', "booking_type" "public"."bookings_booking_type_enum" NOT NULL DEFAULT 'SINGLE', "note" text, CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_64cd97487c5c42806458ab5520" ON "bookings" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "court_prices" ADD CONSTRAINT "FK_34ae42c7f7d0e7e4fb11e4c9b28" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_items" ADD CONSTRAINT "FK_ef31cb9266b7deb19ad60847479" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_items" ADD CONSTRAINT "FK_9b7aa581992016fa0345bb81d14" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_64cd97487c5c42806458ab5520c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_64cd97487c5c42806458ab5520c"`);
        await queryRunner.query(`ALTER TABLE "booking_items" DROP CONSTRAINT "FK_9b7aa581992016fa0345bb81d14"`);
        await queryRunner.query(`ALTER TABLE "booking_items" DROP CONSTRAINT "FK_ef31cb9266b7deb19ad60847479"`);
        await queryRunner.query(`ALTER TABLE "court_prices" DROP CONSTRAINT "FK_34ae42c7f7d0e7e4fb11e4c9b28"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_64cd97487c5c42806458ab5520"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_booking_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_daaae66cf4a27bf05d2530ef8f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_35b603cd86f0632dfd62a643cf"`);
        await queryRunner.query(`DROP TABLE "booking_items"`);
        await queryRunner.query(`DROP TYPE "public"."booking_items_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_34ae42c7f7d0e7e4fb11e4c9b2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0a58ff7d7034c22d0b804d75c5"`);
        await queryRunner.query(`DROP TABLE "court_prices"`);
        await queryRunner.query(`DROP TYPE "public"."court_prices_days_of_week_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_42ada86075cec1699abab27c34"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cf72e44ffba3179344b32cf917"`);
        await queryRunner.query(`DROP TABLE "courts"`);
        await queryRunner.query(`DROP TYPE "public"."courts_type_enum"`);
    }

}
