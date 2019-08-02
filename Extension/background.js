console.log('Start');
var websocket = new WebSocket("ws://localhost:6969");
websocket.onopen = function (evt) {onOpen(evt)};
websocket.onclose = function (evt) {onClose(evt)};
websocket.onerror = function (evt) {onError(evt)};
function onClose(){onOpen();}
function onError(){websocket.close();}

function onOpen(){
  websocket.send(JSON.stringify({
    clientId: '606504719212478504',
    presence: {
      state: 'Testing',
      details: '🍱',
      startTimestamp: Date.now(),
      instance: true,
    }
  }));
  console.log('Send');
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
          websocket.send(JSON.stringify(response));
        }else{
          // Unregister Presence
          console.log('Unregister Presence', tabId);
          delete activeTab[tabId];
          clearInterval(activeInterval);
          disconnect();
        }
      });
    }
  }
}

function disconnect(){
  websocket.send(JSON.stringify({action: 'disconnect'}));
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
