var express = require('express'),
    io = require('socket.io'),
    db = require('dirty')(__dirname + '/log.db');
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
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
    title: 'リアルタイムWebハッカソン Chat Room'
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
  client.broadcast({count: count});
  client.send({count: count});
  db.forEach(function(key, val) {
    client.send(JSON.parse(val));
  });

  client.on('message', function(message) {
    // message
    var now = new Date().getTime();
    message.message.time = now;
    db.set(now, JSON.stringify(message));
    client.broadcast(message);
    client.send(message);
  });
  client.on('disconnect', function() {
    // disconnect
    count--;
    client.broadcast({count: count});
  });
});

