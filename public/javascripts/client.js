var socket = new io.Socket(null, {port: 3004});
socket.connect();
socket.on('message', function(message) {
  if (message.count) {
    $('#count').text(message.count);
  }
  if (message.message) {
    var data = message.message;
    var date = new Date();
    date.setTime(data.time);
    $('#chat').append('<div class="chatlog"><p><a name=' + escape(data.time) + '></a><a href="http://twitter.com/' + escape(data.name) + '"><img src="http://api.dan.co.jp/twicon/' + escape(data.name) + '/mini" /></a> ' + escape(data.text) + '</p><a class="permalink" href="#' + escape(data.time) + '">' + date.toString() + '</a></div>');
    $('#chat').scrollTop(1000000);
  }
});

function send() {
  var name = $('#name').val();
  var text = $('#text').val();
  if (text && name && name != "Twitter ID") {
    socket.send({message: {name: name, text: text}});
    $('#text').val('');
  }
}

function escape(str) {
  return $('<div></div>').text(str).html()
}
