import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

class Appointment extends Model {}

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
