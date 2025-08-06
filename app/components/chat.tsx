'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './chat.module.css';

type Message = {
  role: 'user' | 'assistant';
  text: string;
};

export default function Chat() {
  const [userInput, setUserInput] = useState('');
  const [inputDisabled, setInputDisabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!userInput.trim()) return;

  // Add user message to UI immediately
  setMessages((prev) => [...prev, { role: 'user', text: userInput }]);
  setUserInput('');
  setInputDisabled(true);

  try {
    // ✅ Use all-in-one backend route that handles: create thread + send message + run + respond
    const res = await fetch('/api/assistants/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: userInput }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', text: data.reply || 'Sorry, I couldn’t find an answer.' },
    ]);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', text: 'Error: Unable to reach the assistant.' },
    ]);
  }

  setInputDisabled(false);
};



  return (
    <>
      <div className={styles.header}>
        <img src="/novologo white.png" alt="Novogenia Logo" className={styles.logo} />
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.intro}>
          I am a chat bot trained to answer your questions on the analysis reports, supplements,
          cosmetics or the company. Ask away and I will do my best to answer your questions!
          <br /><br />
          <em>(I am an AI chat bot and I may make mistakes)</em>
        </div>

        <div className={styles.messages}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.role === 'user' ? styles.userMessage : styles.assistantMessage}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            className={styles.input}
          />
          <button type="submit" className={styles.button} disabled={inputDisabled}>
            Send
          </button>
        </form>
      </div>
    </>
  );
}
