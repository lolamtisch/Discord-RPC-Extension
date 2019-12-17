const discordRpc = require('./discord-rich-presence')

var currentId = 0;

var clients = {};

var timeout;

var ws;

function resetTimeout(){
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log('Timeout! Disconnecting');
    disconnect();
  }, 30000);
}

function disconnect(){
  clearTimeout(timeout);
  if(currentId && typeof module.exports.connect(currentId) !== 'undefined'){
    module.exports.connect(currentId).clearPresence();
    console.log('Disconnected: '+currentId)
  }else{
    console.log('Could not disconnect. Because not connected.')
  }
  currentId = 0;
}

module.exports = {
  init: function(websocket) {
    ws = websocket;
  },
  connect: function(clientId) {
    if(!clients[clientId]) {
      clients[clientId] = discordRpc(clientId);
      clients[clientId].on('join', (secret) => {
        console.log('Join', clientId, secret);
        ws.send(JSON.stringify({action: 'join', 'clientId': clientId, 'secret': secret}));
      })
    }
    return clients[clientId];
  },
  send: function(clientId, presence){
    var client = module.exports.connect(clientId);

    if(currentId && currentId !== clientId) {
      disconnect();
    }

    currentId = clientId;

    client.updatePresence(presence);
    resetTimeout();
  },
  keepAlive: function(){
    resetTimeout();
  },
  disconnect: disconnect,
}
