const express = require("express");
const router = express.Router();
const chatSessionsCtrl = require("../controllers/chatSessions.controller.cjs");

// Middlewares
const validatePhone = require("../validators/validatePhone.cjs");

router.post("/", validatePhone, chatSessionsCtrl.saveChatSession);
router.get("/:phone", validatePhone, chatSessionsCtrl.getChatSession);

module.exports = router;
