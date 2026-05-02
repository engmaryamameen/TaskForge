import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateNotificationsTable1777000000000 implements MigrationInterface {
  name = 'CreateNotificationsTable1777000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'userId', type: 'uuid' },
          { name: 'organizationId', type: 'uuid' },
          { name: 'type', type: 'varchar', length: '50' },
          { name: 'title', type: 'varchar', length: '255' },
          { name: 'message', type: 'text', isNullable: true },
          { name: 'entityType', type: 'varchar', length: '50', isNullable: true },
          { name: 'entityId', type: 'uuid', isNullable: true },
          { name: 'read', type: 'boolean', default: false },
          { name: 'actorId', type: 'uuid', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['actorId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({ columnNames: ['userId', 'read'] }),
    );
    await queryRunner.createIndex(
      'notifications',
      new TableIndex({ columnNames: ['userId', 'createdAt'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}
