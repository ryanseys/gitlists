var socket = io.connect('http://localhost:3000');
  socket.on('msg', function (data) {
    console.log(data);
    socket.emit('msg', "got it!");
});
