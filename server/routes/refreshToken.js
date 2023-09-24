const express = require('express');
const router = express.Router();
const refreshTokenRouter = require('../controllers/refreshToken');

router.get('/', refreshTokenRouter.handleRefreshToken);

module.exports = router;
