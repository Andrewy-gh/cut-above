const dateServices = require('./date');
const emailServices = require('./email');
const User = require('../models/User');

const formatData = (date, start, end) => {
  return {
    date: dateServices.easternDate(date),
    start: dateServices.easternDateTime(date, start),
    end: dateServices.easternDateTime(date, end),
    emailId: emailServices.generateEmailId(),
  };
};

const removeEmailToken = async (emailId) => {
  const user = await User.findOne({ emailToken: emailId });
  if (user) {
    user.emailToken = user.emailToken.filter((id) => id !== emailId);
    await user.save();
  }
};

module.exports = { formatData, removeEmailToken };
