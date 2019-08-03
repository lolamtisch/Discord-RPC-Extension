var websocket;

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
    };
    websocket.onopen = function (evt) {
      resolve();
    };
  })
}

var activeTab = {};
var activeInterval;

function checkActiveTab(tabId){
  clearInterval(activeInterval);
  if(typeof activeTab[tabId] !== 'undefined'){
    console.log('Script Found', activeTab[tabId]);
    requestPresence();
    activeInterval = setInterval(function(){
      requestPresence();
    }, 15000);
    function requestPresence(){
      chrome.runtime.sendMessage(activeTab[tabId].extId, activeTab[tabId].tabId, function(response) {
        console.log('response', response);
        if(response){
          sendPresence(response)
        }else{
          // Unregister Presence
          console.log('Unregister Presence', tabId);
          delete activeTab[tabId];
          clearInterval(activeInterval);
          disconnect();
        }
      });
    }
  }else{
    disconnect();
  }
}

function sendPresence(pres){
  websocketReady()
    .then(() => {
      websocket.send(JSON.stringify(pres));
    })

}

function disconnect(){
  websocketReady()
    .then(() => {
      websocket.send(JSON.stringify({action: 'disconnect'}));
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
    disconnect();
  }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log('Tab Changed', activeInfo.tabId);
  checkActiveTab(activeInfo.tabId);
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  console.log('Register', request, sender);
  activeTab[sender.tab.id] = {
    extId: sender.id,
    tabId: sender.tab.id
  };
  sendResponse({status: true});
  if(sender.tab.active){
    checkActiveTab(sender.tab.id);
  }
});
