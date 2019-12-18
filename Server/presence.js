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
  connect: function(clientId, extId = null) {
    if(!clients[clientId]) {
      clients[clientId] = {};
      clients[clientId].clientId = clientId;
      clients[clientId].extId = extId;
      clients[clientId].client = discordRpc(clientId);
      clients[clientId].client.on('join', (secret) => {
        console.log('Join', clientId, secret);
        ws.send(JSON.stringify({action: 'join', 'clientId': clientId, 'extId': extId, 'secret': secret}));
      })

      clients[clientId].client.on('spectate', (secret) => {
        console.log('spectate', clientId, secret);
        ws.send(JSON.stringify({action: 'spectate', 'clientId': clientId, 'extId': extId, 'secret': secret}));
      })

      clients[clientId].client.on('joinRequest', (user) => {
        console.log('joinRequest', clientId, user);
        ws.send(JSON.stringify({action: 'joinRequest', 'clientId': clientId, 'extId': extId, 'user': user}));
      })

    }
    return clients[clientId].client;
  },
  send: function(clientId, presence, extId = null){
    var client = module.exports.connect(clientId, extId);

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
