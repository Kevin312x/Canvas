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

io.on('connection', async (socket) => {
    console.log(`Client: ${socket.id} connected to the server`);

    let all_socket_id = await io.allSockets();
    all_socket_id.delete(socket.id);
    let first_socket_id = all_socket_id.values().next().value;    

    if(all_socket_id.size > 0) { io.to(first_socket_id).emit('req_canvas', {'sender_id': socket.id}); }
    socket.on('canvas_obj', (data) => { io.to(data.target_id).emit('res_canvas', {'canvas': data.canvas}); });
    socket.on('disconnect', () => { console.log(`Client: ${socket.id} disconnected from the server`); });
    socket.on('draw', (data) => { socket.broadcast.emit('point', data); });
    socket.on('start', () => { socket.broadcast.emit('begin_path'); });
});