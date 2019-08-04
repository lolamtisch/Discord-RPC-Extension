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
var passiveTab = {};
var activeInterval;

function checkActiveTab(tabId){
  clearInterval(activeInterval);
  var passiveTabArray = Object.values(passiveTab);
  if(typeof activeTab[tabId] !== 'undefined'){
    console.log('Script Found', activeTab[tabId]);
    var data = [activeTab[tabId], {active: true}, () => {delete activeTab[tabId];}];
    requestPresence(...data);
    activeInterval = setInterval(function(){
      requestPresence(...data);
    }, 15000);
  }else if(passiveTabArray.length){
    console.log('Passive Found', passiveTabArray[0]);
    var data = [passiveTabArray[0], {active: (passiveTabArray[0].tabId === tabId)}, () => {delete passiveTab[passiveTabArray[0].tabId];}]
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
