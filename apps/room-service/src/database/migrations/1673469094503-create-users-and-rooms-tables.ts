import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUsersAndRoomsTables1673469094503
  implements MigrationInterface
{
  name = 'createUsersAndRoomsTables1673469094503';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "rooms" 
            (
                "id"         uuid                   NOT NULL DEFAULT uuid_generate_v4(), 
                "name"       character varying(256) NOT NULL, 
                "created_at" TIMESTAMP              NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP              NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP, 
                CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id")
            )`,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_rooms_updated_at" ON "rooms" ("updated_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_rooms_deleted_at" ON "rooms" ("deleted_at") `,
    );

    await queryRunner.query(
      `CREATE TABLE "users" 
            (
                "id"         uuid                   NOT NULL DEFAULT uuid_generate_v4(), 
                "room_id"    uuid, 
                "email"      character varying(256) NOT NULL, 
                "created_at" TIMESTAMP              NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP              NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP, 
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), 
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )`,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_users_room_id" ON "users" ("room_id") `,
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
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_1e1a0d791813fd8606ba8d10063" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_1e1a0d791813fd8606ba8d10063"`,
    );
    await queryRunner.query(`DROP INDEX "public"."ix_users_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."ix_users_updated_at"`);
    await queryRunner.query(`DROP INDEX "public"."ux_users_email"`);
    await queryRunner.query(`DROP INDEX "public"."ix_users_room_id"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."ix_rooms_deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."ix_rooms_updated_at"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
  }
}
