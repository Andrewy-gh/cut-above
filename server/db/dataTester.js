// date: new Date('2023-08-26T04:00:00Z'),
// open: new Date('2023-08-26T14:00:00Z'),
// close: new Date('2023-08-26T22:00:00Z'),

// db.appointments.findOne({ _id: ObjectId('64c537249aef2be4a9276ee2') });

const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const users = [
  1034, 1035, 1036, 1037, 1038, 1039, 1040, 1041, 1042, 1043, 1044, 1045, 1046,
  1047, 1048, 1049, 1050, 1051, 1052, 1053,
];
const employees = [
  '64a60e878bdf8a4ac0f98209',
  '64a60f1a8bdf8a4ac0f98210',
  '64a60fcec756d17d2dea4592',
];

// ! Change this variable for date
const startDate = '2023-09-12';

function getRandomDuration() {
  const durations = ['15', '30', '45', '60'];
  return durations[Math.floor(Math.random() * durations.length)];
}
function getRandomTime() {
  const hours = Math.floor(Math.random() * 8) + 14; // ! Random hours between 14 and 22
  const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)]; // Random minutes from [0, 15, 30, 45]
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
} //10:45, 16:15 currently: 10am - 12
function generateAppointments(clients, employees) {
  const appointments = [];
  const numAppointments = Math.floor(Math.random() * 20); // 5
  const availableClients = [...clients];
  const availableEmployees = [...employees];

  for (let i = 0; i < numAppointments; i++) {
    const randomTime = getRandomTime();
    console.log('randomTime: ', randomTime);
    const startTime = dayjs.utc(`${startDate}T${randomTime}`);
    console.log('startTime', startTime);
    const duration = getRandomDuration();
    const randomEmployeeID =
      availableEmployees[Math.floor(Math.random() * availableEmployees.length)];
    const randomClientIndex = Math.floor(
      Math.random() * availableClients.length
    );
    const clientId = availableClients[randomClientIndex];
    availableClients.splice(randomClientIndex, 1);
    const endTime = startTime.add(duration, 'minute');
    const start = startTime.toISOString();
    const end = endTime.toISOString();
    console.log('start: ', start, 'end: ', end);
    const employeeAppt = appointments.filter(
      (appointment) => appointment.employee === randomEmployeeID
    );
    const employeeBooked = employeeAppt.some(
      (appointment) =>
        dayjs(appointment.start).isBefore(end) &&
        dayjs(appointment.end).isAfter(start)
    );
    if (!employeeBooked) {
      const appointment = {
        // scheduleId,
        date: `${startDate}T04:00:00Z`,
        start,
        end,
        clientId,
        employee: randomEmployeeID,
      };
      appointments.push(appointment);
    }
  }
  return appointments;
}

const testData = generateAppointments(users, employees);
console.log('testData', testData);
function validateAppointments(appointments) {
  // Step 1: Sort appointments by start time
  appointments.sort((a, b) => a.start.localeCompare(b.start));

  const errors = [];

  // Step 2: Iterate and validate
  for (let i = 0; i < appointments.length - 1; i++) {
    const current = appointments[i];
    const next = appointments[i + 1];

    if (current.employee === next.employee) {
      if (current.end > next.start) {
        errors.push(
          `Employee ${current.employee} has overlapping appointments.`
        );
      }
    }
  }

  // Step 3: Check for consistency
  for (const appointment of appointments) {
    if (appointment.start >= appointment.end) {
      errors.push(`Invalid time range for employee ${appointment.employee}.`);
    }
  }

  return errors;
}

const appointments = [...testData]; // Your array of appointments

const validationErrors = validateAppointments(appointments);

if (validationErrors.length === 0) {
  console.log('No errors found in appointments.');
} else {
  console.log('Validation Errors:');
  validationErrors.forEach((error) => console.log(error));
}
