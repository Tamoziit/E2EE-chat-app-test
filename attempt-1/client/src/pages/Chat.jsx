import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { encrypt, decrypt } from '../crypto/nacl';

export default function Chat() {
    const socket = useSocket();
    const user = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');

    useEffect(() => {
        socket?.on('receive-message', msg => {
            if (msg.receiver !== user.username) return;

            const decrypted = decrypt(
                msg.ciphertext,
                msg.nonce,
                msg.senderPublicKey,
                user.privateKey
            );
            setMessages(m => [...m, decrypted]);
        });
    }, [socket]);

    const send = () => {
        const encrypted = encrypt(
            text,
      /* receiver public key */ user.publicKey,
            user.privateKey
        );

        socket.emit('send-message', {
            sender: user.username,
            receiver: 'bob',
            senderPublicKey: user.publicKey,
            ...encrypted
        });
        setText('');
    };
    console.log(messages)

    return (
        <>
            {messages.map((m, i) => <p key={i}>{m}</p>)}
            <input value={text} onChange={e => setText(e.target.value)} />
            <button onClick={send}>Send</button>
        </>
    );
}
