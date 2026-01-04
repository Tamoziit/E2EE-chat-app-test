const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

mongoose.connect('mongodb://localhost:27017/e2ee-chat');

const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    publicKey: String,
    socketId: String
}));

const Message = mongoose.model('Message', new mongoose.Schema({
    sender: String,
    receiver: String,
    encForReceiver: String,
    nonceForReceiver: String,
    encForSender: String,
    nonceForSender: String,
    timestamp: { type: Date, default: Date.now }
}));

app.get('/api/messages/:u1/:u2', async (req, res) => {
    const messages = await Message.find({
        $or: [{ sender: req.params.u1, receiver: req.params.u2 },
        { sender: req.params.u2, receiver: req.params.u1 }]
    }).sort('timestamp');
    res.json(messages);
});

io.on('connection', (socket) => {
    socket.on('register', async ({ username, publicKey }) => {
        await User.findOneAndUpdate({ username }, { publicKey, socketId: socket.id }, { upsert: true });
        io.emit('user_list', await User.find({}, 'username publicKey'));
    });

    socket.on('send_message', async (data) => {
        const msg = await Message.create(data);
        const recipient = await User.findOne({ username: data.receiver });
        if (recipient) io.to(recipient.socketId).emit('receive_message', msg);
    });

    socket.on('disconnect', async () => {
        await User.deleteOne({ socketId: socket.id });
        io.emit('user_list', await User.find({}, 'username publicKey'));
    });
});

server.listen(3001, () => console.log('Server running on 3001'));