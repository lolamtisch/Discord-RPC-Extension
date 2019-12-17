const discordRpc = require('./discord-rich-presence')

var currentId = 0;

var clients = {};

var timeout;

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
  connect: function(clientId) {
    if(!clients[clientId]) {
      clients[clientId] = discordRpc(clientId);
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
