const express = require('express');
const path = require('path');

const app = express();

// 1. حل مشكلة CORS للعمل على GitHub Pages و Render بدون Failed to fetch
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '20mb' }));
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // التحقق من وجود مفتاح Groq المجاني أو OpenAI
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "لم يتم ضبط مفتاح الـ API في إعدادات السيرفر." });
    }

    // التبديل التلقائي إلى Groq إن وجد مفتاحه
    const isGroq = Boolean(process.env.GROQ_API_KEY);
    const endpoint = isGroq 
      ? "https://api.groq.com/openai/v1/chat/completions" 
      : "https://api.openai.com/v1/chat/completions";
    const model = isGroq ? "llama-3.3-70b-versatile" : "gpt-4o-mini";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: "أنت Zide، مساعد ذكاء اصطناعي متقدم يتحدث بالعربية بأسلوب طبيعي ومفيد." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || "خطأ في الاتصال بالذكاء الاصطناعي" });
    }

    const reply = data.choices?.[0]?.message?.content || "لم تصل إجابة.";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
