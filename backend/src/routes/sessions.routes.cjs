const express = require('express');
const router = express.Router();

const sessionCtrl = require('../controllers/sessions.controller.cjs');
const authJwt = require('../middlewares/authJwt.cjs');

router.get('/', authJwt, sessionCtrl.listSessions);
router.delete('/:id', authJwt, sessionCtrl.revokeSession);
router.delete('/', authJwt, sessionCtrl.revokeAllSessions);

module.exports = router;