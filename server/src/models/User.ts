import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  HasManyGetAssociationsMixin,
} from 'sequelize';
import { sequelize } from '../utils/db.js';
import { UserRole } from '../types/index.js';
import type Appointment from './Appointment.js';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare passwordHash: string;
  declare role: UserRole;
  declare image: string | null;
  declare profile: string | null;

  // Association methods
  declare getAppointments: HasManyGetAssociationsMixin<Appointment>;
  declare getEmployeeAppointments: HasManyGetAssociationsMixin<Appointment>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('client', 'employee', 'admin'),
      defaultValue: 'client',
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    profile: {
      type: DataTypes.STRING,
    },
  },
  {
    defaultScope: { attributes: { exclude: ['passwordHash'] } },
    scopes: {
      withoutPassword: {
        attributes: { exclude: ['passwordHash'] },
      },
      // only used to log in user
      withPassword: {
        attributes: { include: ['passwordHash'] },
      },
    },
    sequelize,
    timestamps: false,
    underscored: true,
    modelName: 'user',
  }
);

export default User;
