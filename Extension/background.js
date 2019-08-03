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
var passiveTab = {};
var activeInterval;

function checkActiveTab(tabId){
  clearInterval(activeInterval);
  var passiveTabArray = Object.values(passiveTab);
  if(typeof activeTab[tabId] !== 'undefined'){
    console.log('Script Found', activeTab[tabId]);
    requestPresence(activeTab[tabId], () => {delete activeTab[tabId];});
    activeInterval = setInterval(function(){
      requestPresence(activeTab[tabId], () => {delete activeTab[tabId];});
    }, 15000);
  }else if(passiveTabArray.length){
    console.log('Passive Found', passiveTabArray[0]);
    requestPresence(passiveTabArray[0], () => {delete passiveTab[passiveTabArray[0].tabId];});
    activeInterval = setInterval(function(){
      requestPresence(passiveTabArray[0], () => {delete passiveTab[passiveTabArray[0].tabId];});
    }, 15000);
  }else{
    disconnect();
  }

  function requestPresence(tabInfo, removeTab){
    chrome.runtime.sendMessage(tabInfo.extId, tabInfo.tabId, function(response) {
      console.log('response', response);
      if(response){
        websocket.send(JSON.stringify(response));
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
    passiveTab[sender.tab.id] = {
      extId: sender.id,
      tabId: sender.tab.id
    };
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
