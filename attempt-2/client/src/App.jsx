import React, { useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import { generateKeyPair, encryptMessage, decryptMessage } from './crypto';
import { encodeBase64 } from 'tweetnacl-util';

const socket = io('http://localhost:3001');

export default function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  // In production, you'd store this in LocalStorage
  const keyPair = useMemo(() => generateKeyPair(), []);

  useEffect(() => {
    if (isLoggedIn && selectedUser) {
      fetch(`http://localhost:3001/api/messages/${username}/${selectedUser.username}`)
        .then(res => res.json()).then(setChat);
    }
  }, [selectedUser, isLoggedIn]);

  useEffect(() => {
    socket.on('user_list', setUsers);
    socket.on('receive_message', (msg) => {
      if (msg.sender === selectedUser?.username || msg.receiver === selectedUser?.username) {
        setChat(prev => [...prev, msg]);
      }
    });
    return () => socket.off();
  }, [selectedUser]);

  const handleSend = () => {
    if (!selectedUser || !message) return;

    // 1. Encrypt for Receiver
    const forThem = encryptMessage(keyPair.secretKey, selectedUser.publicKey, message);
    // 2. Encrypt for Myself (using my own public key as the peer)
    const forMe = encryptMessage(keyPair.secretKey, encodeBase64(keyPair.publicKey), message);

    const payload = {
      sender: username,
      receiver: selectedUser.username,
      encForReceiver: forThem.encrypted,
      nonceForReceiver: forThem.nonce,
      encForSender: forMe.encrypted,
      nonceForSender: forMe.nonce
    };

    socket.emit('send_message', payload);
    setChat(prev => [...prev, payload]);
    setMessage('');
  };

  if (!isLoggedIn) return (
    <div style={{ padding: '50px' }}>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <button onClick={() => { socket.emit('register', { username, publicKey: encodeBase64(keyPair.publicKey) }); setIsLoggedIn(true); }}>Join</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '200px', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h3>Contacts</h3>
        {users.filter(u => u.username !== username).map(u => (
          <div key={u.username} onClick={() => setSelectedUser(u)} style={{ cursor: 'pointer', padding: '5px', background: selectedUser?.username === u.username ? '#ddd' : 'transparent' }}>
            {u.username}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chat.map((msg, i) => {
            const isMe = msg.sender === username;
            const peerKey = isMe ? encodeBase64(keyPair.publicKey) : (users.find(u => u.username === msg.sender)?.publicKey);
            const content = decryptMessage(
              keyPair.secretKey,
              peerKey,
              isMe ? msg.encForSender : msg.encForReceiver,
              isMe ? msg.nonceForSender : msg.nonceForReceiver
            );
            return (
              <div key={i} style={{ textAlign: isMe ? 'right' : 'left', margin: '5px' }}>
                <span style={{ padding: '8px', borderRadius: '10px', background: isMe ? '#007bff' : '#eee', color: isMe ? 'white' : 'black' }}>
                  {content}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '10px' }}>
          <input value={message} onChange={e => setMessage(e.target.value)} style={{ width: '80%' }} />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}