// 📁 client/src/components/AIChatBot.js

import React, { useState } from 'react';
import '../styles/components/AIChatBot.css';

export default function AIChatBot({ loggedInUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, user: loggedInUser })
      });
      const data = await res.json();
      const aiMessage = { sender: 'bot', text: data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Something went wrong 🤖" }]);
    }

    setLoading(false);
  };

  return (
    <div className="chatbox">
      <div className="chat-header">SmartTask Assistant 🤖</div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="message bot">Thinking...</div>}
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything about your tasks..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
