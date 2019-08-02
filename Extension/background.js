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

function tabFocusChanged(tab){
  console.log(tab.title);
  websocket.send(JSON.stringify({
    clientId: '606504719212478504',
    presence: {
      state: tab.title,
      details: '🍱',
      startTimestamp: Date.now(),
      instance: true,
    }
  }));
}

chrome.windows.onFocusChanged.addListener(function(activeWindowId) {
  console.log('Window Changed', activeWindowId);
  if(activeWindowId >= 0){
    chrome.tabs.query({ active: true, windowId: activeWindowId }, function (tabs) {
      if(tabs.length){
        tabFocusChanged(tabs[0]);
      }
    });
  }else{
    console.log('Browser not focused');
    websocket.send(JSON.stringify({action: 'disconnect'}));
  }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log('Tab Changed', activeInfo.tabId);
  chrome.tabs.get(activeInfo.tabId, function(tab){
    tabFocusChanged(tab);
  });
});
