const express = require('express');
const router = express.Router();
const emailRouter = require('../controllers/email');
const middleware = require('../utils/middleware');

router.post(
  '/confirmation',
  middleware.verifyJWT,
  emailRouter.handleConfirmation
);
router.post(
  '/modification',
  middleware.verifyJWT,
  emailRouter.handleModification
);
router.post(
  '/cancellation',
  middleware.verifyJWT,
  emailRouter.handleCancellation
);
router.post('/new-message', emailRouter.handleMessageReceived);
router.post('/reset-pw', emailRouter.handlePasswordReset);

module.exports = router;
