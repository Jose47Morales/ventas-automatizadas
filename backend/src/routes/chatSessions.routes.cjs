const express = require("express");
const router = express.Router();
const chatSessionsCtrl = require("../controllers/chatSessions.controller.cjs");

router.post("/", chatSessionsCtrl.saveChatSession);
router.get("/:user_phone", chatSessionsCtrl.getChatSession);

module.exports = router;
