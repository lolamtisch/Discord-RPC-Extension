const version = "0.1.2";
const discord = require('./Server/presence');
const WebSocket = require('ws');

process.on('uncaughtException', function(e) {
  console.log('Uncaught Exception...');
  console.log(e.stack);
  setTimeout(function(){
    process.exit(99);
  }, 10000);
});

console.log("Starting", version);

const wss = new WebSocket.Server({
  port: 6969
});

wss.on('connection', function connection(ws) {
  console.log('Connected');
  ws.on('message', function incoming(data) {
    data = JSON.parse(data);
    console.log('Recived', data);
    if(typeof data.action !== 'undefined'){
      switch (data.action) {
        case 'disconnect':
          discord.disconnect();
          break;
        case 'party':
          data.listener.forEach((el) => {
            discord.connect(el.clientId, el.extId);
          });
          break;
        case 'reply':
          discord.reply(data.user, data.clientId, data.response);
          break;
      }
    }else{
      discord.send(data.clientId, data.presence, data.extId);
    }
  });
  ws.send(JSON.stringify({version: version}));
  discord.init(ws);
});

console.log('WebSocket created');

process.stdin.resume();
