const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    require: true,
  },
  passwordHash: {
    type: String,
  },
  role: {
    type: String,
    enum: ['client', 'employee', 'admin'],
    default: 'client',
  },
  schedule: {
    type: String,
  },
  refreshToken: [String],
  emailToken: [String],
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // the passwordHash should not be revealed
    delete returnedObject.refreshToken;
    delete returnedObject.passwordHash;
  },
});

module.exports = mongoose.model('User', userSchema);
