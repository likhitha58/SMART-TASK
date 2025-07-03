import { poolPromise, sql } from '../config/db.js';
import axios from 'axios';

export const handleChatQuery = async (req, res) => {
  const { query, user } = req.body;

  const apiKey = process.env.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;

  try {
    const pool = await poolPromise;
    const tasksResult = await pool
      .request()
      .input('username', sql.VarChar, user.username)
      .query('SELECT * FROM Tasks WHERE AssignedTo = @username');

    const tasks = tasksResult.recordset;

    const userDetails = `Username: ${user.username}, Department: ${user.department}`;
    const taskSummary = tasks.map(t => `• ${t.title} (${t.dueDate})`).join('\n');

    const prompt = `
You are a helpful assistant. Here is the user's context:
${userDetails}

Here are their tasks:
${taskSummary}

User's question: "${query}"
Respond accordingly.
    `;

    const openaiRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        }
      }
    );

    const response = openaiRes.data.choices[0].message.content;
    res.json({ response });

  }  catch (err) {
  console.error('Chatbot error:', err?.response?.data || err.message || err);
  res.status(500).json({ error: 'AI assistant failed to respond.' });
}
};
