// server.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OLLAMA_KEY || "37d4349dfa2b46879c70c92d9b9cee36.392XjBh9kQ0E3_ljCByj0icZ";

app.post("/api/chat", async (req, res) => {
  const response = await fetch("https://ollama.com/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "qwen3:32b",
      messages: req.body.messages,
      stream: true
    })
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  const reader = response.body.getReader();
  while(true){
    const {value, done} = await reader.read();
    if(done) break;
    res.write(value);
  }
  res.end();
});

app.listen(10000);