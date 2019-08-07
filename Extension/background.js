var websocket;
var websocketOk = false;
var currendState = null;

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
    };
  })
}

chrome.storage.local.set({'presence': null});

var activeTab = {};
var passiveTab = new Map();
var activeInterval;

function checkActiveTab(tabId){
  clearInterval(activeInterval);
  if(typeof activeTab[tabId] !== 'undefined'){
    console.log('Script Found', activeTab[tabId]);
    var data = [activeTab[tabId], {active: true}, () => {delete activeTab[tabId];}];
    requestPresence(...data);
    activeInterval = setInterval(function(){
      requestPresence(...data);
    }, 15000);
  }else if(passiveTab.size){
    if(passiveTab.has(tabId)){
      var temp = passiveTab.get(tabId);
      passiveTab.delete(tabId);
      passiveTab.set(tabId, temp);
    }
    var tab = Array.from(passiveTab.values()).pop();
    console.log('Passive Found', tab);
    var data = [tab, {active: (tab.tabId === tabId)}, () => {passiveTab.delete(tab.tabId);}]
    requestPresence(...data);
    activeInterval = setInterval(function(){
      requestPresence(...data);
    }, 15000);
  }else{
    disconnect();
  }

  function requestPresence(tabInfo, info, removeTab){
    chrome.runtime.sendMessage(tabInfo.extId, {tab: tabInfo.tabId, info: info}, function(response) {
      console.log('response', response);
      if(response){
        if(typeof response.clientId !== 'undefined'){
          sendPresence(response);
        }else{
          disconnect();
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

function sendPresence(pres){
  websocketReady()
    .then(() => {
      websocket.send(JSON.stringify(pres));
      currendState = pres.presence;
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

chrome.windows.onFocusChanged.addListener(function(activeWindowId) {
  console.log('Window Changed', activeWindowId);
  if(activeWindowId >= 0){
    chrome.tabs.query({ active: true, windowId: activeWindowId }, function (tabs) {
      if(tabs.length){
        checkActiveTab(tabs[0].id);
      }
    });
  }else{
    console.log('Browser not focused');
    checkActiveTab(0);
  }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log('Tab Changed', activeInfo.tabId);
  checkActiveTab(activeInfo.tabId);
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  console.log('Register', request, sender);
  if(request.mode == 'passive'){
    passiveTab.set(sender.tab.id, {
      extId: sender.id,
      tabId: sender.tab.id
    });
  }else{
    activeTab[sender.tab.id] = {
      extId: sender.id,
      tabId: sender.tab.id
    };
  }

  sendResponse({status: true});
  if(sender.tab.active){
    checkActiveTab(sender.tab.id);
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse({
    websocket: websocketOk,
    presence: currendState
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
