const express = require('express');
const router = express.Router();
const userRouter = require('../controllers/user');
const middleware = require('../utils/middleware');

router.route('/validate-token/:option/:token').get(userRouter.validateToken);
router.route('/resetpw').post(userRouter.resetPassword);
router
  .route('/')
  .get(middleware.verifyJWT, userRouter.getAllUsers)
  .put(middleware.verifyJWT, userRouter.changeEmail)
  .delete(middleware.verifyJWT, userRouter.removeUserData);

router.route('/email').put(middleware.verifyJWT, userRouter.changeEmail);
router.route('/password').put(middleware.verifyJWT, userRouter.changePassword);

module.exports = router;
