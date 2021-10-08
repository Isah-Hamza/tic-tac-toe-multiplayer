import { Server } from "socket.io";
import express from "express";
import http from 'http';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('../public'));

app.get('/',(req, res) => {
    res.sendFile('../public/index.html')
})

io.on('connection', (socket) => {
    socket.on('game-play', ({ portion, index }) => {
        socket.broadcast.emit('game-play', { portion, index });
    });
    socket.on('restart', () => {
        socket.broadcast.emit('restart');
    })
})

server.listen('5000', () => {
    console.log('server listening on port 5000')
})