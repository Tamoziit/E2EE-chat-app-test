import Message from '../models/Message.js';
import User from '../models/User.js';

export default function socketHandler(io) {
    io.on('connection', socket => {
        console.log(`[SOCKET CONNECTED] id=${socket.id}`);

        socket.on('register', async ({ username, publicKey }) => {
            try {
                if (!username || !publicKey) {
                    console.warn('[REGISTER FAILED] Missing username or publicKey');
                    return;
                }

                await User.findOneAndUpdate(
                    { username },
                    { publicKey },
                    { upsert: true, new: true }
                );

                socket.username = username;
                socket.join(username); // 🔑 private room

                console.log(`[REGISTER] user=${username} socket=${socket.id}`);
            } catch (err) {
                console.error('[REGISTER ERROR]', err);
            }
        });

        socket.on('send-message', async data => {
            try {
                const { sender, receiver, ciphertext, nonce } = data;

                if (!sender || !receiver || !ciphertext || !nonce) {
                    console.warn('[SEND FAILED] Invalid payload', data);
                    return;
                }

                const msg = await Message.create(data);

                // 🔐 emit only to receiver
                io.to(receiver).emit('receive-message', msg);

                console.log(
                    `[MESSAGE] ${sender} → ${receiver} | msgId=${msg._id}`
                );
            } catch (err) {
                console.error('[SEND MESSAGE ERROR]', err);
            }
        });

        socket.on('disconnect', reason => {
            console.log(
                `[DISCONNECT] user=${socket.username ?? 'unknown'} id=${socket.id} reason=${reason}`
            );
        });
    });
}