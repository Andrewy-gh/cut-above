'use strict';
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const config = require('../config/config');

const generateEmailId = () => {
  return uuidv4();
};

const options = (employee, date, time, option, emailLink) => {
  const templates = {
    confirmation: {
      subject: `Your booking at Cut Above Barbershop:`, // Subject line
      text: `Thank you for booking with us. You are confirmed for an appointment on ${date} at ${time} with ${employee}. If you need to modify or cancel your appointment, please log into your account on https://cutaboveshop.fly.dev or use this link: ${emailLink}`, // plain text body
    },
    modification: {
      subject: `Booking with Cut Above Barbershop has changed.`, // Subject line
      text: `Your original booking has been changed. You are now confirmed for an appointment on ${date} at ${time} with ${employee}. If you need to modify or cancel your appointment, please log into your account on https://cutaboveshop.fly.dev or use this link: ${emailLink}`, // plain text body
    },
    cancellation: {
      subject: `Booking with Cut Above Barbershop has cancelled.`, // Subject line
      text: `Your booking  on ${date} at ${time} with ${employee} has been cancelled. We are sorry to hear you can't make it. For any future needs, we are always here for you.`, // plain text body
    },
    // Link immediately disabled?
    'reset password': {
      subject: 'Instructions to reset your password.',
      text: `Follow this link to change your password: ${emailLink}. Once clicked this link will be immediately disabled. You also only have one hour before this link becomes inactive.`,
    },
  };

  if (option in templates) {
    return templates[option];
  } else {
    throw new Error(`Invalid template option type: '${option}'`);
  }
};

const sendEmail = async ({
  receiver,
  employee,
  date,
  time,
  option,
  emailLink,
}) => {
  const transporter = nodemailer.createTransport({
    service: config.EMAIL_SERVICE,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASSWORD,
    },
  });

  const senderReceiverOptions = {
    from: config.EMAIL_USER,
    to: receiver,
  };

  const emailTemplate = options(employee, date, time, option, emailLink);
  const fullEmailOptions = { ...senderReceiverOptions, ...emailTemplate };
  // Send Email
  try {
    const info = await transporter.sendMail(fullEmailOptions);
    console.log({ info });
  } catch (err) {
    console.error({ err });
  }
};

module.exports = { generateEmailId, sendEmail };
