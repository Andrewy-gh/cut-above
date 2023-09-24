const express = require('express');
const router = express.Router();
const logoutRouter = require('../controllers/logout');

router.get('/', logoutRouter.handleLogout);

module.exports = router;
