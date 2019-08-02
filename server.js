const discord = require('./Server/presence');
const WebSocket = require('ws');

const wss = new WebSocket.Server({
  port: 6969
});

wss.on('connection', function connection(ws) {
  console.log('Connected');
  ws.on('message', function incoming(data) {
    data = JSON.parse(data);
    console.log('Recived', data);
    discord.send(data.clientId, data.presence);
  });
  ws.send('Connected!');
});

process.stdin.resume();
