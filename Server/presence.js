const discordRpc = require('discord-rich-presence')

var currentId = 0;

var client;

var timeout;

function resetTimeout(){
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log('Timeout! Disconnecting');
    client.disconnect();
    currentId = 0;
  }, 30000);
}

function disconnect(){
  clearTimeout(timeout);
  if(currentId && typeof client !== 'undefined'){
    client.disconnect();
  }else{
    console.log('Could not disconnect. Because not connected.')
  }
  currentId = 0;
}

module.exports = {
  send: function(clientId, presence){
    if(currentId !== clientId || !currentId){
      if(typeof client !== 'undefined'){
        client.disconnect();
      }
      client = discordRpc(clientId);
      currentId = clientId;
    }
    client.updatePresence(presence);
    resetTimeout();
  },
  keepAlive: function(){
    resetTimeout();
  },
  disconnect: disconnect,
}
