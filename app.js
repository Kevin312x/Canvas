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

    if(all_socket_id.size > 0) { io.to(first_socket_id).emit('req_data', {'sender_id': socket.id}); }
    socket.on('data', (data) => { io.to(data.target_id).emit('res_data', {'canvas': data.canvas, 'messages': data.messages}); });
    socket.on('disconnect', () => { console.log(`Client: ${socket.id} disconnected from the server`); io.emit('server_msg', {'message': `User '${socket.username}' has left the chat.`}); });
    socket.on('draw', (data) => { socket.broadcast.emit('point', data); });
    socket.on('start', () => { socket.broadcast.emit('begin_path'); });
    socket.on('send_msg', (data) => { io.emit('rec_msg', {'msg': data.msg, 'sender': socket.username || socket.id}) });
    socket.on('set_username', (data) => { socket.username = data.username; io.emit('server_msg', {'message': `User '${socket.username}' has joined the chat.`}); });
});