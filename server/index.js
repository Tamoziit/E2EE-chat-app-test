import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import socketHandler from './socket/socket.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

socketHandler(io);

server.listen(process.env.PORT, () =>
    console.log('Server running on port', process.env.PORT)
);