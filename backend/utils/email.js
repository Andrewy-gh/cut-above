'use strict';
const nodemailer = require('nodemailer');

const sendEmail = async ({ receiver, employee, date, time }) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const options = {
    from: process.env.EMAIL_USER,
    to: `${receiver}`,
    subject: `Your Reservation at Cut Above`, // Subject line
    text: `Thank for making a reservation. You are confirmed for an appointment on ${date} at ${time} with ${employee}.`, // plain text body
    html: `<div>Thank for making a reservation. You are confirmed for an appointment on ${date} at ${time} with ${employee}.</div>`, // html body
  };

  // Send Email
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log({ err });
    } else {
      console.log({ info });
    }
  });
};

module.exports = sendEmail;
