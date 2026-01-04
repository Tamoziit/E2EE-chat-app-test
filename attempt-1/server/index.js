import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import socketHandler from './socket/socket.js';
import morgan from 'morgan';
import helmet from "helmet";

dotenv.config();

const app = express();

app.use(cors({
    origin: ['http://localhost:5173'], // Vite
    credentials: true,
}));
app.use(express.json());
app.use(morgan("common"));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

mongoose.connect(process.env.MONGO_URI);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

socketHandler(io);

server.listen(process.env.PORT, () =>
    console.log('Server running on port', process.env.PORT)
);