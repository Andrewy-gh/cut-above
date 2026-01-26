import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  // Create users table
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('client', 'employee', 'admin'),
      allowNull: false,
      defaultValue: 'client',
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profile: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  // Create schedules table
  await queryInterface.createTable('schedules', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    open: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    close: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // Create appointments table
  await queryInterface.createTable('appointments', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    service: {
      type: DataTypes.ENUM(
        'Haircut',
        'Beard Trim',
        'Straight Razor Shave',
        'Cut and Shave Package',
        'The Full Package'
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'checked-in', 'completed', 'no show'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    schedule_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'schedules',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  });

  // Create password_reset_tokens table
  await queryInterface.createTable('password_reset_tokens', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    token_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    times_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  });

  // Create indexes for better query performance
  await queryInterface.addIndex('appointments', ['client_id']);
  await queryInterface.addIndex('appointments', ['employee_id']);
  await queryInterface.addIndex('appointments', ['schedule_id']);
  await queryInterface.addIndex('appointments', ['start']);
  await queryInterface.addIndex('schedules', ['open']);
  await queryInterface.addIndex('password_reset_tokens', ['user_id']);
}

export async function down(queryInterface: QueryInterface) {
  // Drop tables in reverse order (respect foreign key constraints)
  await queryInterface.dropTable('password_reset_tokens');
  await queryInterface.dropTable('appointments');
  await queryInterface.dropTable('schedules');
  await queryInterface.dropTable('users');
}
