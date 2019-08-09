const version = "0.0.1";
const discord = require('./Server/presence');
const WebSocket = require('ws');

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
      }
    }else{
      discord.send(data.clientId, data.presence);
    }
  });
  ws.send('Connected!');
});

console.log('WebSocket created');

process.stdin.resume();
