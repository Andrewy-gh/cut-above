import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../utils/db.js';
import type { EmailData } from '../services/emailService.js';

export type EmailOutboxStatus = 'pending' | 'processing' | 'sent' | 'failed';

class EmailOutbox extends Model<
  InferAttributes<EmailOutbox>,
  InferCreationAttributes<EmailOutbox>
> {
  declare id: CreationOptional<string>;
  declare eventType: string;
  declare dedupeKey: string;
  declare payload: EmailData;
  declare status: EmailOutboxStatus;
  declare attempts: CreationOptional<number>;
  declare availableAt: CreationOptional<Date>;
  declare lockedAt: Date | null;
  declare lockedBy: string | null;
  declare lastError: string | null;
  declare sentAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

EmailOutbox.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dedupeKey: {
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
    availableAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lockedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastError: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    underscored: true,
    modelName: 'email_outbox',
    timestamps: true,
  }
);

export default EmailOutbox;
