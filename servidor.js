//configuracion del servicio http para nodejs

//impoertamos los modulos necesario
var express = require('express');
var app = express();

//creamos el servidor http
var server = require('http').createServer(app);

var io = require('socket.io').listen(server);

var nicknames = {};

var clicks = [];

server.listen(3000);


app.get('/', function(req, res){
    res.sendFile(__dirname + '/game.html');
});

app.get('/home', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

//sockets
io.sockets.on('connection', function( socket ){
    socket.on('sendMessage', function(data,nick){
        console.log(nick + ' - ' + data);
        io.sockets.emit('newMessage', { msg:data, nick:nick });
    });

    socket.on('newUser', function(data, callback){
        if(data in nicknames){
            callback(false);
        }else{
            callback(true);
            socket.nickneme = data;
            nicknames[socket.nickneme] = 1;
            updateNickNames();
        }
    });

    socket.on('start', function(bar){
        console.log('iniciar ');
        io.sockets.emit('started');
        var i = 0;
        setInterval(function(){
            if(i < 101) io.sockets.emit('newval', i++);
            else{
                clearInterval(this);
                io.sockets.emit('finish', clicks.reverse().shift());
            }
        },200);
    });

    socket.on('disconnect', function(data){
        if(!socket.nickneme) return;
        delete nicknames[socket.nickneme];
        updateNickNames();
    });

    function updateNickNames(){
        io.sockets.emit('usernames', nicknames);
    };

    socket.on('game', function(data){
        console.log(data);
    });

    socket.on('newclick', function(nick){
        clicks.push(nick);
    });

    console.log('Se ha conectado un nuevo cliente, puerto: 3000');
});