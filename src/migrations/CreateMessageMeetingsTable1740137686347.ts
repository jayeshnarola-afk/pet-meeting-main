import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMessageMeetingsTable1740137686347 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "message_meetings",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "message_id",
                        type: "int"
                    },
                    {
                        name: "dating_creator",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "dating_partner",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255"
                    },
                    {
                        name: "address",
                        type: "text"
                    },
                    {
                        name: "distance_km",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "latitude",
                        type: "decimal",
                        precision: 10,
                        scale: 8,
                        isNullable: true
                    },
                    {
                        name: "longitude",
                        type: "decimal",
                        precision: 11,
                        scale: 8,
                        isNullable: true
                    },
                    {
                        name: "meeting_status",
                        type: "varchar",
                        length: "20",
                        default: "'pending'"
                    },
                    {
                        name: "canceled_reason",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "schedule_time",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "image_url",
                        type: "varchar",
                        length: "255",
                        isNullable: true
                    },
                    {
                        name: "rating",
                        type: "float",
                        isNullable: true
                    },
                    {
                        name: "place_id",
                        type: "varchar",
                        length: "100",
                        isNullable: true
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP"
                    }
                ]
            }),
            true
        );

        // Foreign Keys
        await queryRunner.createForeignKey(
            "message_meetings",
            new TableForeignKey({
                columnNames: ["message_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "message",
                onDelete: "CASCADE"
            })
        );

        await queryRunner.createForeignKey(
            "message_meetings",
            new TableForeignKey({
                columnNames: ["dating_creator"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "SET NULL"
            })
        );

        await queryRunner.createForeignKey(
            "message_meetings",
            new TableForeignKey({
                columnNames: ["dating_partner"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "SET NULL"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("message_meetings");
    }
}

