const userRouter = require('express').Router();
const User = require('../models/User');

userRouter.get('/', async (request, response) => {
  const users = await User.find({});
  response.status(200).json(users);
});

userRouter.delete('/:id', async (request, response) => {
  const user = await User.findById(request.params.id);
  const admin = await User.findById(request.user);
  if (admin.role !== 'admin') {
    return response
      .status(403)
      .json({ error: 'User does not have admin privileges' });
  }
  if (user.role === 'admin') {
    return response.status(403).json({ error: 'Admin cannot be deleted' });
  }

  await User.findByIdAndDelete(request.params.id);
  response.status(200).json({
    success: true,
    message: 'User successfully deleted',
  });
});

module.exports = userRouter;
