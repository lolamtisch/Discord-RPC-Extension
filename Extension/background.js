var websocket;
var websocketOk = false;
var currendState = null;
var serverVersion = null;
var api = {
  disabledDomains: [],
}

chrome.storage.sync.get(['disabledDomains'], function(result) {
  api = result;
  if(typeof api.disabledDomains === 'undefined') api.disabledDomains = [];
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    console.log('update', changes)
    if(namespace === 'sync'){
      for (var key in changes) {
        api[key] = changes[key].newValue;
      }
    }
  });
  console.log('Disabled Domains', api.disabledDomains);
});

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
      chrome.tabs.create({url: chrome.extension.getURL('installPage/install.html')}, function (tab) {
        console.info("Open installPage");
      });
    }else if(details.reason == "update"){
    }
});

function clientIsUpToDate() {
  if(!serverVersion || serverVersion === '0.1.2') return true;
  return false;
}

async function websocketReady(){
  return new Promise(function(resolve, reject){
    if(typeof websocket !== 'undefined' && websocket.readyState === 1){// Connection is fine
      resolve();
      return;
    }
    websocket = new WebSocket("ws://localhost:6969");
    websocket.onerror = function(evt) {
      console.error(evt);
      reject('Could not connect to Server');
      websocketOk = false;
      setPresenceIcon();
    };
    websocket.onopen = function (evt) {
      resolve();
      websocketOk = true;
      setPresenceIcon();
      updatePartyListener();
    };
    websocket.onmessage = function (evt) {
      var data = JSON.parse(evt.data);
      if(typeof data.version !== 'undefined'){
        console.log("Server", data.version);
        serverVersion = data.version;
      }else if(typeof data.action !== 'undefined'){
        switch (data.action) {
          case "join":
            console.log('join', data);
            chrome.runtime.sendMessage(data.extId, {action: 'join', clientId: data.clientId, secret: data.secret}, function(response) {
              console.log('join redirected', response);
            });
            break;
          case "joinRequest":
            console.log('joinRequest', data);
            chrome.runtime.sendMessage(data.extId, {action: 'joinRequest', clientId: data.clientId, user: data.user, tab: currendState.tabInfo.tabId}, function(replyResponse) {
              console.log('joinRequest response', replyResponse);
              websocket.send(JSON.stringify({
                action: 'reply',
                user: data.user,
                clientId: data.clientId,
                response: replyResponse
              }));
            });
            break;
          default:
            console.error('Unknown action', data);
            break;
        }
      }else{
        console.error('Unknown message', data);
      }

    };
  })
}

chrome.storage.local.set({'presence': null});

var activeTab = {};
var passiveTab = new Map();
var backgroundTab = {};
var activeInterval;
var focusTimeout;

function checkActiveTab(tabId){
  clearInterval(activeInterval);
  if(typeof activeTab[tabId] !== 'undefined'){
    console.log('Script Found', activeTab[tabId]);
    var data = [activeTab[tabId], {active: true}, () => {delete activeTab[tabId];}, () => {checkActiveTab(0);}];
    activeInterval = setInterval(function(){
      requestPresence(...data);
    }, 15000);
    requestPresence(...data);
  }else if(passiveTab.size || Object.keys(backgroundTab).length){
    if(passiveTab.has(tabId)){
      var temp = passiveTab.get(tabId);
      passiveTab.delete(tabId);
      passiveTab.set(tabId, temp);
    }
    // Combine background and passive tab array as they are handled the same way
    var pTabs = Object.values(backgroundTab).concat(Array.from(passiveTab.values()));
    passive();
    function passive(){
      if(pTabs.length){
        clearInterval(activeInterval);
        var tab = pTabs.pop();
        console.log('Passive Found', tab);
        // Background Page
        if (tab.domain === tab.tabId) {
          var data = [tab, {active: false}, () => {delete backgroundTab[tab.tabId];}, () => {passive();}]
        } else {
          var data = [tab, {active: (tab.tabId === tabId)}, () => {passiveTab.delete(tab.tabId);}, () => {passive();}]
        }

        activeInterval = setInterval(function(){
          requestPresence(...data);
        }, 15000);
        requestPresence(...data);
      }else{
        disconnect();
      }

    }
  }else{
    disconnect();
  }

  function requestPresence(tabInfo, info, removeTab, disconnectEvent = () => {}){
    if(api.disabledDomains.includes(tabInfo.domain)){
      console.log('Filter', tabInfo, currendState);
      if(currendState && typeof currendState.tabInfo !== 'undefined' && tabInfo.tabId === currendState.tabInfo.tabId){
        disconnect();
      }

      disconnectEvent();
      return;
    }
    chrome.runtime.sendMessage(tabInfo.extId, {action: 'presence', tab: tabInfo.tabId, info: info}, function(response) {
      console.log('response', response);
      if(response){
        if(typeof response.clientId !== 'undefined'){
          sendPresence(response, tabInfo);
        }else{
          if(currendState && typeof currendState.tabInfo !== 'undefined' && tabInfo.tabId === currendState.tabInfo.tabId){
            disconnect();
          }
          disconnectEvent();
        }

      }else{
        // Unregister Presence
        console.log('Unregister Presence', tabId);
        removeTab();
        clearInterval(activeInterval);
        disconnect();
        checkActiveTab(tabId);
      }
    });
  }
}

function sanitizePresence(pres) {
  //if emtpy
  if(typeof pres.presence.details !== 'undefined' && pres.presence.details === "") {
    delete pres.presence.details;
  }
  if(typeof pres.presence.state !== 'undefined' && pres.presence.state  === "") {
    delete pres.presence.state;
  }
  if(typeof pres.presence.largeImageKey !== 'undefined' && pres.presence.largeImageKey === "") {
    delete pres.presence.largeImageKey;
  }
  if(typeof pres.presence.smallImageKey !== 'undefined' && pres.presence.smallImageKey === "") {
    delete pres.presence.smallImageKey;
  }
  if(typeof pres.presence.largeImageText !== 'undefined' && pres.presence.largeImageText === "") {
    delete pres.presence.largeImageText;
  }
  if(typeof pres.presence.smallImageText !== 'undefined' && pres.presence.smallImageText === "") {
    delete pres.presence.smallImageText;
  }

  if (typeof pres.presence.endTimestamp !== 'undefined'){
    pres.presence.endTimestamp = Math.round(pres.presence.endTimestamp);
  }

  if (typeof pres.presence.startTimestamp !== 'undefined'){
    pres.presence.startTimestamp = Math.round(pres.presence.startTimestamp);
  }

  //party
  if (!/^\d+$/.test(pres.presence.partySize) || !/^\d+$/.test(pres.presence.partyMax) || pres.presence.partySize > pres.presence.partyMax){
    delete pres.presence.partySize;
    delete pres.presence.partyMax;
  }
  //state
  if(typeof pres.presence.state !== 'undefined') {
   pres.presence.state = pres.presence.state.substring(0,127);
  }
  //details
  if(typeof pres.presence.details !== 'undefined') {
    pres.presence.details = pres.presence.details.substring(0,127);
  }
  //endtimestamp
  if (typeof pres.presence.endTimestamp !== 'undefined' && (!/^\d+$/.test(pres.presence.endTimestamp) || pres.presence.endTimestamp === "")){
    delete pres.presence.endTimestamp;
  }
  //starttimestamp
  if (typeof pres.presence.startTimestamp !== 'undefined' && (!/^\d+$/.test(pres.presence.startTimestamp) || pres.presence.startTimestamp === "")){
    delete pres.presence.startTimestamp;
  }
  //buttons
  if (typeof pres.presence.buttons !== 'undefined' && pres.presence.buttons.length > 2) {
    while (pres.presence.buttons.length > 2) {
      pres.presence.buttons.pop();
    }
  }
  if (typeof pres.presence.buttons !== 'undefined' && !pres.presence.buttons.length) delete pres.presence.buttons;
  return pres;
}

function sendPresence(pres, tapInfo){
  websocketReady()
  .then(() => {
    pres = sanitizePresence(pres);
    pres.extId = tapInfo.extId;
    websocket.send(JSON.stringify(pres));
    currendState = {
      presence: pres.presence,
      tabInfo: tapInfo
    };
    setPresenceIcon();
  })
}

function disconnect(){
  websocketReady()
    .then(() => {
      websocket.send(JSON.stringify({action: 'disconnect'}));
      currendState = null;
      setPresenceIcon();
    });
}

var partyListener = {};
function updatePartyListener(){
  var listener = Object.values(partyListener);
  if(listener.length) {
    websocket.send(JSON.stringify({action: 'party', listener: listener}));
  }else{
    console.log('No listener to send')
  }
}

chrome.windows.onFocusChanged.addListener(function(activeWindowId) {
  clearTimeout(focusTimeout);
  console.log('Window Changed', activeWindowId);
  if(activeWindowId >= 0){
    chrome.tabs.query({ active: true, windowId: activeWindowId }, function (tabs) {
      if(tabs.length){
        checkActiveTab(tabs[0].id);
      }
    });
  }else{
    console.log('Browser not focused');
    focusTimeout = setTimeout(() => {
      console.log('Focus Timeout');
      checkActiveTab(0);
    }, (60 * 1000));
  }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log('Tab Changed', activeInfo.tabId);
  checkActiveTab(activeInfo.tabId);
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if(typeof request.mode !== 'undefined') {
    console.log('Register', request, sender);
    if(!sender.tab){
      backgroundTab[sender.id] = {
        domain: sender.id,
        extId: sender.id,
        tabId: sender.id
      }
    }else if(request.mode == 'passive'){
      passiveTab.set(sender.tab.id, {
        domain: getDomain(sender.url),
        extId: sender.id,
        tabId: sender.tab.id
      });
    }else{
      activeTab[sender.tab.id] = {
        domain: getDomain(sender.url),
        extId: sender.id,
        tabId: sender.tab.id
      };
    }

    sendResponse({status: true});
    if(sender.tab && sender.tab.active){
      checkActiveTab(sender.tab.id);
    }

    function getDomain(url){
      url = url.split('/')[2];
      url = url.replace(/www.?\./i, '');
      return url;
    }
  }else if(typeof request.action !== 'undefined') {
    switch (request.action) {
      case "party":
        console.log('party', request);
        partyListener[request.clientId] = {
          clientId: request.clientId,
          extId: sender.id,
        }
        updatePartyListener();
        break;
      case "state":
        console.log('state');
        var st = {
          connected: false,
          upToDate: false,
          error: false,
        };

        st.connected = websocketOk;
        st.upToDate = clientIsUpToDate();
        if (!st.connected) {
          st.error = {
            code: 901,
            message: 'Application is not running or is not installed',
            url: 'https://github.com/lolamtisch/Discord-RPC-Extension/releases/latest',
          }
        }
        sendResponse(st);
        websocketReady()
        break;
      default:
        console.error('Unknown runtime action', request, sender);
        break;
    }
  }else{
    console.error('Unknown runtime message', request, sender);
  }

});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse({
    websocket: websocketOk,
    clientIsUpToDate: clientIsUpToDate(),
    state: currendState
  })
});

var img = new Image();
img.src = chrome.extension.getURL('icons/icon16.png');
function setPresenceIcon(){
  if(currendState || !websocketOk){
    var canvas = document.createElement('canvas');
    canvas.width = 19;
    canvas.height = 19;

    var context = canvas.getContext('2d');

    context.drawImage(img, 0, 0, 19, 19);

    context.beginPath();
    context.arc(14, 14, 5, 0, 2 * Math.PI);

    if(!websocketOk){
      context.fillStyle = 'red';
    }else{
      context.fillStyle = 'lime';
    }
    context.fill();
    context.lineWidth = 1;
    if(!websocketOk){
      context.strokeStyle = 'red';
    }else{
      context.strokeStyle = 'green';
    }

    context.stroke();

    chrome.browserAction.setIcon({
      imageData: context.getImageData(0, 0, 19, 19)
    });
  }else{
    chrome.browserAction.setIcon({
      path: "icons/icon16.png"
    });
  }

}
websocketReady();
