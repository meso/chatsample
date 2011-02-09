var express = require('express'),
    io = require('socket.io'),
    db = require('dirty')(__dirname + '/log.db'),
    json = JSON.stringify;
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.use(express.bodyDecoder());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
  app.use(express.logger());
});

app.configure('development', function(){
  express.logger("development mode");
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  express.logger("production mode");
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index.jade', {
    locals: {
        title: 'リアルタイムWebハッカソン Chat Room'
    }
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3004);
  console.log("Express server listening on port %d", app.address().port)
}

var socket = io.listen(app);
var count = 0;
socket.on('connection', function(client) {
  count++;
  client.broadcast(json({count: count}));
  client.send(json({count: count}));
  db.forEach(function(key, val) {
    client.send(val);
  });

  client.on('message', function(message) {
    // message
    db.set(new Date().getTime(), message);
    client.broadcast(message);
    client.send(message);
  });
  client.on('disconnect', function() {
    // disconnect
    count--;
    client.broadcast(json({count: count}));
  });
});

