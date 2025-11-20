// server.js
const express = require("express");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 1010;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/api/send", async (req, res) => {
  const { webhook, content, username, avatar_url, embeds } = req.body;

  if (!webhook || (!content && (!embeds || embeds.length === 0))) {
    return res.status(400).json({ error: "Missing content or embed" });
  }

  try {
    const payload = {
      content: content || undefined,
      username: username || undefined,
      avatar_url: avatar_url || undefined,
      embeds: Array.isArray(embeds) ? embeds : undefined,
    };

    const discordResp = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!discordResp.ok) {
      const text = await discordResp.text();
      return res.status(502).json({ error: "Discord error", body: text });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
