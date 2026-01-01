import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { sequelize } from '../utils/db.js';
import { AppointmentService, AppointmentStatus } from '../types/index.js';

class Appointment extends Model<
  InferAttributes<Appointment>,
  InferCreationAttributes<Appointment>
> {
  declare id: CreationOptional<string>;
  declare date: Date;
  declare start: Date;
  declare end: Date;
  declare service: AppointmentService;
  declare status: AppointmentStatus;
  declare clientId: ForeignKey<string>;
  declare employeeId: ForeignKey<string>;
  declare scheduleId: ForeignKey<string>;
}

Appointment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
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
  },
  { sequelize, timestamps: false, underscored: true, modelName: 'appointment' }
);

export default Appointment;
