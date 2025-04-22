require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

let history = [];

app.get('/', (req, res) => {
  res.render('index', { messages: history });
});

app.post('/chat', async (req, res) => {
  const userMsg = req.body.message;
  history.push({ role: 'user', content: userMsg });

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo', // bạn có thể thay bằng claude-3, mistral, llama3, gpt-4...
        messages: history,
      },
      {
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://localhost',  // hoặc domain của bạn
            'Content-Type': 'application/json',
          }          
      }
    );

    const botReply = response.data.choices[0].message.content;
    history.push({ role: 'assistant', content: botReply });

    res.render('index', { messages: history });
  } catch (error) {
    console.error('Lỗi gọi OpenRouter:', error.message);
    history.push({ role: 'assistant', content: "❌ Có lỗi xảy ra. Vui lòng thử lại." });
    res.render('index', { messages: history });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
