import Message from "../models/Message.js";
import User from "../models/User.js";

export default function socketHandler(io) {
    io.on('connection', socket => {

        socket.on('register', async ({ username, publicKey }) => {
            await User.findOneAndUpdate(
                { username },
                { publicKey },
                { upsert: true }
            );
            socket.username = username;
        });

        socket.on('send-message', async data => {
            const msg = await Message.create(data);
            io.emit('receive-message', msg);
        });
    });
}
