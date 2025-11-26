const chatSessionsService = require("../services/chatSessions.service.cjs");

module.exports = {
  saveChatSession: async (req, res) => {
    const { user_phone, state, data } = req.body;

    if (!user_phone || !state) {
      return res.status(400).json({ success: false, error: "Faltan campos obligatorios" });
    }

    try {
      const session = await chatSessionsService.saveSession({ user_phone, state, data });
      res.json({ success: true, session });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getChatSession: async (req, res) => {
    const { user_phone } = req.params;
    if (!user_phone) {
      return res.status(400).json({ success: false, error: "Falta el número de usuario" });
    }

    try {
      const session = await chatSessionsService.getSession(user_phone);
      if (!session) return res.status(404).json({ success: false, message: "No se encontró sesión" });

      res.json({ success: true, session });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
