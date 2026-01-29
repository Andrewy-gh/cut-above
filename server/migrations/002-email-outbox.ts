import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('email_outbox', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    event_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dedupe_key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'sent', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    available_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.createTable('email_deliveries', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    dedupe_key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('sending', 'sent', 'failed'),
      allowNull: false,
      defaultValue: 'sending',
    },
    provider_message_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.addIndex('email_outbox', ['status', 'available_at']);
  await queryInterface.addIndex('email_outbox', ['dedupe_key'], {
    unique: true,
  });
  await queryInterface.addIndex('email_deliveries', ['dedupe_key'], {
    unique: true,
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('email_deliveries');
  await queryInterface.dropTable('email_outbox');
}
