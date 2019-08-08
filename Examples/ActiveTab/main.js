var extensionId = "londahcleefkodmnlammpkcdjekmmafj"; //Chrome
if(typeof browser !== 'undefined' && typeof chrome !== "undefined"){
  extensionId = "1cf038ecb5fc74f2a6ca0811c2c14d89fc230b89@temporary-addon"; //Firefox
}

// Register Presence
chrome.runtime.sendMessage(extensionId, {mode: 'active'}, function(response) {
  console.log('Presence registred', response)
});

// Wait for presence Requests
chrome.runtime.onMessage.addListener(function(info, sender, sendResponse) {
  console.log('Presence requested', info);
  sendResponse(getPresence());
});

// Return Presence
var time = Date.now()
function getPresence(){
  return {
    clientId: '606504719212478504',
    presence: {
      state: document.title ? document.title : window.location.hostname,
      details: '🍱',
      startTimestamp: time,
      instance: true,
    }
  };
}
