var extensionId = "londahcleefkodmnlammpkcdjekmmafj";

// Register Presence
chrome.runtime.sendMessage(extensionId, {mode: 'active'}, function(response) {
  console.log('Presence registred')
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
