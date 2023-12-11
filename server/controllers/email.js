const email = require('../utils/email');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

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
    emailLink: `${config.CLIENT_URL}/appointment/${emailId}`,
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
    emailLink: `${config.CLIENT_URL}/appointment/${emailId}`,
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
    emailLink: `${config.CLIENT_URL}/resetpw/?token=${resetEmailToken}`,
  });
  res.status(200).json({
    success: true,
    message:
      'If an user exists with this email, an email with reset instructions has been sent.',
  });
};

const handleMessageReceived = async (req, res) => {
  console.log(req.body);
  const { contactDetails } = req.body;
  const messageRecordKeeping = await email.sendEmail({
    receiver: config.EMAIL_USER,
    option: 'message submission',
    contactDetails,
  });
  const messageAutoResponse = await email.sendEmail({
    receiver: contactDetails.email,
    option: 'message auto reply',
  });
  res.status(200).json({
    success: true,
    message:
      'Message has been received. You can expect a response in a timely manner.',
  });
};

module.exports = {
  handleConfirmation,
  handleModification,
  handleCancellation,
  handlePasswordReset,
  handleMessageReceived,
};
