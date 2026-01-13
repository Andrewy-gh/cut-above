import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { sequelize } from '../utils/db.js';

class PasswordResetToken extends Model<
  InferAttributes<PasswordResetToken>,
  InferCreationAttributes<PasswordResetToken>
> {
  declare id: CreationOptional<string>;
  declare tokenHash: string;
  declare timesUsed: CreationOptional<number>;
  declare expiresAt: CreationOptional<Date>;
  declare userId: ForeignKey<string>;
}

PasswordResetToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timesUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 2,
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("NOW() + INTERVAL '1 hour'"),
    },
  },
  {
    sequelize,
    timestamps: false,
    underscored: true,
    modelName: 'password_reset_token',
  }
);

export default PasswordResetToken;
