import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

class Schedule extends Model {}

Schedule.init(
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
    open: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    close: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { sequelize, timestamps: false, underscored: true, modelName: 'schedule' }
);

export default Schedule;
