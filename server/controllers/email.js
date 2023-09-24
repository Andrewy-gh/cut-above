const email = require('../utils/email');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleConfirmation = async (req, res) => {
  const { employee, date, time, emailId } = req.body;
  const user = await User.findOne({ _id: req.user });
  const bookedEmployee = await User.findOne({ _id: employee });
  const emailSent = await email.sendEmail({
    receiver: user.email,
    employee: bookedEmployee.firstName,
    date,
    time,
    option: 'confirmation',
    emailLink: `https://cutaboveshop.fly.dev/appointment/${emailId}`,
  });
  res.status(200).json({ success: true, message: 'Confirmation email sent' });
};

const handleModification = async (req, res) => {
  const { employee, date, time, emailId } = req.body;
  const user = await User.findOne({ _id: req.user });
  const bookedEmployee = await User.findOne({ _id: employee });
  const emailSent = await email.sendEmail({
    receiver: user.email,
    employee: bookedEmployee.firstName,
    date,
    time,
    option: 'modification',
    emailLink: `https://cutaboveshop.fly.dev/appointment/${emailId}`,
  });
  res.status(200).json({ success: true, message: 'Modification email sent' });
};

const handleCancellation = async (req, res) => {
  const { employee, date, time } = req.body;
  const user = await User.findOne({ _id: req.user });
  const cancelledEmployee = await User.findOne({ _id: employee });
  const emailSent = await email.sendEmail({
    receiver: user.email,
    employee: cancelledEmployee.firstName,
    date,
    time,
    option: 'cancellation',
  });
  res.status(200).json({ success: true, message: 'Cancellation email sent' });
};

const handlePasswordReset = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  // ! Handle no user
  const emailId = email.generateEmailId();
  const resetEmailToken = jwt.sign(
    {
      id: emailId,
    },
    process.env.RESET_TOKEN_SECRET,
    { expiresIn: '1h' }
  );
  user.emailToken.push(emailId);
  await user.save();
  const emailSent = await email.sendEmail({
    receiver: user.email,
    option: 'reset password',
    emailLink: `https://cutaboveshop.fly.dev/resetpw/?token=${emailToken}`,
  });
  res.status(200).json({
    success: true,
    message:
      'If an user exists with this email, an email with reset instructions has been sent.',
  });
};

module.exports = {
  handleConfirmation,
  handleModification,
  handleCancellation,
  handlePasswordReset,
};
