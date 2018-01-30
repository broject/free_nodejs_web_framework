/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


exports.init = function (server, app) {
    var socketio = require('socket.io');
    var socket_redis = require('socket.io-redis');
    var io = socketio(server);
// Tell Socket.IO to use the redis adapter. By default, the redis
// server is assumed to be on localhost:6379. You don't have to
// specify them explicitly unless you want to change them.
    io.adapter(socket_redis({host: 'localhost', port: 6379}));
    var chat_socket = io.of('/chat');

    chat_socket.on('connection', function (client_socket) {
        var log = process.pid + ', ' + client_socket.id + ' : Connected';
        console.log(log);

        client_socket.on('login', function (data) {
            client_socket.emit('ilogged', {id: client_socket.id, pid: process.pid, data: data});
            client_socket.broadcast.emit('ulogged', {id: client_socket.id, pid: process.pid, data: data});

            log = process.pid + ', ' + client_socket.id + ' : Logged';
            console.log(log);
        });

        client_socket.on('message', function (data) {
            var msg = process.pid + " : " + data;
            client_socket.broadcast.emit('message', msg);
        });

        client_socket.on('disconnect', function () {
            client_socket.broadcast.emit('uclosed', {id: client_socket.id, pid: process.pid});

            log = process.pid + ', ' + client_socket.id + ' : Disconnected';
            console.log(log);
        });
    });
    
    /*
     var user_model = require('./context').model('user');
     user_model.init_default_data_if_not_exists(function (flag) {
     
     if (flag) {
     
     console.log('CHAT server PID: ' + process.pid + ', PORT: ' + config.port + ' started.');
     
     } else {
     
     console.log('CHAT server is not started.');
     
     }
     
     });*/
};