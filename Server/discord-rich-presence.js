// Based on https://github.com/devsnek/discord-rich-presence/blob/master/index.js
'use strict';

const Discord = require("@xhayper/discord-rpc");
const EventEmitter = require('events');

function makeClient(clientId) {
  const rpc = new Discord.Client({ clientId });

  let connected = false;
  let activityCache = null;

  const instance = new class RP extends EventEmitter {
    updatePresence(d) {
      if (connected) {
        rpc.user?.setActivity(d).catch((e) => this.emit("error", e));
      } else {
        activityCache = d;
      }
    }

    clearPresence() {
      if (connected) {
        rpc.user?.clearActivity().catch((e) => this.emit("error", e));
      } else {
        activityCache = null;
      }
    }

    reply(user, response) {
      const handle = (e) => this.emit('error', e);
      switch (response) {
        case 'YES':
          rpc.user?.sendJoinInvite(user).catch(handle);
          break;
        case 'NO':
        case 'IGNORE':
          rpc.user?.closeJoinRequest(user).catch(handle);
          break;
        default:
          console.error('unknown response');
      }
    }

    disconnect() {
      rpc.destroy().catch((e) => this.emit("error", e));
    }
  }();

  rpc.on('error', (e) => instance.emit('error', e));

  rpc.on('disconnected', (e) => instance.emit('disconnected', e));

  rpc.login()
    .then(() => {
      instance.emit('connected');
      connected = true;

      rpc.subscribe('ACTIVITY_JOIN', ({ secret }) => {
        instance.emit('join', secret);
      });
      rpc.subscribe('ACTIVITY_SPECTATE', ({ secret }) => {
        instance.emit('spectate', secret);
      });
      rpc.subscribe('ACTIVITY_JOIN_REQUEST', (user) => {
        instance.emit('joinRequest', user);
      });

      if (activityCache) {
        rpc.user
          ?.setActivity(activityCache)
          .catch((e) => instance.emit("error", e));
        activityCache = null;
      }
    })
    .catch((e) => instance.emit('error', e));

  return instance;
}

module.exports = makeClient;
