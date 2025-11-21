import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMessageTable1234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "message",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "conversation_id",
                        type: "int"
                    },
                    {
                        name: "message_id",
                        type: "bigint",
                        isNullable: true
                    },
                    {
                        name: "sender_id",
                        type: "int"
                    },
                    {
                        name: "is_location_active",
                        type: "boolean",
                        default: true
                    },
                    {
                        name: "schedule_time",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "meeting_status",
                        type: "varchar",
                        length: "50",
                        isNullable: true
                    },
                    {
                        name: "is_deleted_by_admin",
                        type: "boolean",
                        default: false
                    },
                    {
                        name: "content",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "message_type",
                        type: "varchar",
                        length: "50",
                        default: "'text'"
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "NOW()"
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "NOW()"
                    },
                    {
                        name: "images",
                        type: "json",
                        isNullable: true
                    },
                    {
                        name: "status",
                        type: "varchar",
                        length: "50",
                        default: "'sent'"
                    },
                    {
                        name: "media_url",
                        type: "varchar",
                        length: "255",
                        isNullable: true
                    },
                    {
                        name: "deleted_at",
                        type: "timestamp",
                        isNullable: true
                    }
                ]
            }),
            true
        );

        // Foreign Keys
        await queryRunner.createForeignKey(
            "message",
            new TableForeignKey({
                columnNames: ["conversation_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "conversations",
                onDelete: "CASCADE"
            })
        );

        await queryRunner.createForeignKey(
            "message",
            new TableForeignKey({
                columnNames: ["sender_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("message");
    }
}

