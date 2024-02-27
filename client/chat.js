import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const socketRef = useRef(null); // Create a mutable ref for the socket
  
    useEffect(() => {
      socketRef.current = io({
        auth: {
          serverOffset: 0
        }
      });
  
      socketRef.current.on('connect', () => {
        console.log('Conectado al servidor de socket');
      });
  
      socketRef.current.on('chat message', (msg, serverOffset) => {
        setMessages(prevMessages => [...prevMessages, msg]);
        socketRef.current.auth.serverOffset = serverOffset;
      });
  
      return () => {
        socketRef.current.disconnect();
      };
    }, []);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (inputValue && socketRef.current) {
        console.log("submit")
        socketRef.current.emit('chat message', inputValue);
        setInputValue('');
      }
    };

  return (
    <section id="chat">
      <ul id="messages">
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <form id="form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="message"
          id="input"
          placeholder="Type a message"
          autoComplete="off"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit">Enviar</button>
      </form>
    </section>
  );
};

export default Chat;
