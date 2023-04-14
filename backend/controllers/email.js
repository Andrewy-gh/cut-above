const emailRouter = require('express').Router();
const User = require('../models/User');
const sendEmail = require('../utils/email');

emailRouter.post('/confirmation', async (request, response) => {
  const { employee, date, time } = request.body;
  const user = await User.findOne({ _id: request.user });
  const emailSent = await sendEmail({
    receiver: user.email,
    employee,
    date,
    time,
  });
  response.status(200).json({ success: true, message: 'Email sent' });
});

module.exports = emailRouter;
