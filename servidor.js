//configuracion del servicio http para nodejs

//importamos los modulos necesario
var express = require('express');

//se creauna isntancia del modulo importado
var app = express();

//creamos el servidor http basado en la instancia
var server = require('http').createServer(app);

//importamos el modulo de control de sockets
var io = require('socket.io').listen(server);

//se incluye ademas el modulo moment para manejos de tiempo
var moment = require('moment');

//se dá formato inicial al modulo
moment().format('YYYY-MM-DD HH:mm:ss');

//se crea una variable del tipo [Objeto] que almacenará los nombres de los participantes
var nicknames = {};

//se crea una variable de tipo Array() que almacenará los nombres de los participantes que hagan click en el tiempo de juego
var clicks = [];

//se inicia el servicio en el puerto 3000
server.listen(3000);

//se crea una funcion que responderá a las peticiones de tipo http:GET en la raiz del sitio
app.get('/', function(req, res){
    //como respuesta se envia un archivo llamado "game.html"
    res.sendFile(__dirname + '/game.html');
});
//para una segunda pagina se crea otra ruta, en este caso será /home
app.get('/home', function(req, res){
    //para esta peticion se envia un archivo de nombre "index.html"
    res.sendFile(__dirname + '/index.html');
});

//a partir de aquí se crean y describen los sockets. estos trabajan en base a eventos. estos eventos se manejarán con
//los métodos "on" y "emit"

//el primer evento del tipo on('connection') está predeterminado en el modulo de socket.io y espera cualquier cliente
//que se conecte con el sitio y establece un socket de comunicación que permanecerá hasta que el cliente sea cerrado.
//se pasa un parámetro socket que será el manejador de los siguientes eventos entre el cliente y el servidor.
io.sockets.on('connection', function( socket ){

    //el evento sendMessage espera que se emita un mensaje desde el cliente, este se aplica en el caso del chat
    socket.on('sendMessage', function(data,nick){
        io.sockets.emit('newMessage', { msg:data, nick:nick });
    });

    //newUser recibe el nombre de un usuario
    socket.on('newUser', function(data, callback){
        //se verifica que no esté contenido yá en la lista de usuarios
        if(data in nicknames)
            callback(false);//si está regresa un callback false que indicará que el usuario ya esta en la lista
        else{
            //si no está regresa un callback true
            callback(true);
            //incluye la data como nombre del usuario
            socket.nickneme = data;
            //agrega un objeto nicname con los datos del usuario
            nicknames[socket.nickneme] = 1;
            //refresca la lista de usuario
            updateNickNames();
        }
    });

    //inicia el juego
    socket.on('start', function(bar){
        console.log('iniciando partida - ' + moment().toDate());
        io.sockets.emit('started');
        var i = 0;
        setInterval(function(){
            if(i < 101) io.sockets.emit('newval', i++);
            else{
                clearInterval(this);
                io.sockets.emit('finish', clicks.reverse().shift());
                console.log('Ha terminado la partida - ' + moment().toDate());
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
        console.log(nick + ' - ' + moment().toDate());
    });

    console.log('Se ha conectado un nuevo cliente, puerto: 3000');
});