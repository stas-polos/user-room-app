import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUsersTable1673467809796 implements MigrationInterface {
  name = 'createUsersTable1673467809796';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" 
             (
                 "id"              uuid                   NOT NULL DEFAULT uuid_generate_v4(), 
                 "email"           character varying(256) NOT NULL, 
                 "hashed_password" character varying      NOT NULL, 
                 "in_room"         boolean                NOT NULL DEFAULT false,
                 "created_at"      TIMESTAMP              NOT NULL DEFAULT now(), 
                 "updated_at"      TIMESTAMP              NOT NULL DEFAULT now(), 
                 "deleted_at"      TIMESTAMP, 
                 CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), 
                 CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "ux_users_email" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_users_updated_at" ON "users" ("updated_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_users_deleted_at" ON "users" ("deleted_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."ix_users_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."ix_users_updated_at"`);
    await queryRunner.query(`DROP INDEX "public"."ux_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
