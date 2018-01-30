/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


exports.run = function () {
    var loader = require('./loader').instance();
    /* don't use yet
     * var app = require('express')();
     var server = require('http').Server(app);
     var io = require('socket.io')(server);
     var redis = require('socket.io-redis');
     var http = app.listen(80, function () {
     console.log('ProcId : ' + process.pid + ' is listening to all incoming requests...');
     });*/

    // Note we don't use a port here because the master listens on it for us.
    var express = require('express');
    var app = new express();
    // Don't expose our internal server to the outside.
    var server = app.listen();

    /*app.module[web] init*/
    var web_core = loader.module('web');
    web_core.init(express, app);

    /*server.module[chat] init*/
    if (loader.options.modules.chat.enable) {
        var chat_lib = loader.module('chat');
        chat_lib.init(server, app);
    }

    return server;
};