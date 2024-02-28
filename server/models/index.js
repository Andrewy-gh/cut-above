import User from './user.js';
import Appointment from './appointment.js';
import Schedule from './schedule.js';
import PasswordResetToken from './passwordResetToken.js';

User.hasMany(Appointment, {
  foreignKey: 'clientId',
  as: 'appointments',
});
User.hasMany(Appointment, {
  foreignKey: 'employeeId',
  as: 'employeeAppointments',
});

Appointment.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
Appointment.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
Schedule.hasMany(Appointment, { foreignKey: 'scheduleId', as: 'appointments' });
Appointment.belongsTo(Schedule, { foreignKey: 'scheduleId', as: 'schedule' });
PasswordResetToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.sync({ alter: true });
Appointment.sync({ alter: true });
Schedule.sync({ alter: true });
PasswordResetToken.sync({ alter: true });

export { User, Appointment, Schedule, PasswordResetToken };
