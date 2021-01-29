const express = require('express');
const app = express();
const PORT = 3000;
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

http.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});

io.on('connection', (socket) => {
    console.log(`Client: ${socket.id} connected to the server`);
    // socket.client.conn.server.clientsCount -> current number of connections

    socket.on('disconnect', () => {
        console.log(`Client: ${socket.id} disconnected from the server`);
    });

    socket.on('draw', (data) => {
       socket.broadcast.emit('point', data);
    });

    socket.on('open', () => {
        socket.broadcast.emit('begin_path');
    })
});