import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../utils/db.js';

export type EmailDeliveryStatus = 'sending' | 'sent' | 'failed';

class EmailDelivery extends Model<
  InferAttributes<EmailDelivery>,
  InferCreationAttributes<EmailDelivery>
> {
  declare id: CreationOptional<string>;
  declare dedupeKey: string;
  declare status: EmailDeliveryStatus;
  declare providerMessageId: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

EmailDelivery.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    dedupeKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('sending', 'sent', 'failed'),
      allowNull: false,
      defaultValue: 'sending',
    },
    providerMessageId: {
      type: DataTypes.STRING,
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
    modelName: 'email_delivery',
    timestamps: true,
  }
);

export default EmailDelivery;
