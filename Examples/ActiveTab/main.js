var extensionId = "londahcleefkodmnlammpkcdjekmmafj";

// Register Presence
chrome.runtime.sendMessage(extensionId, '', function(response) {
  console.log('Presence registred')
});

// Wait for presence Requests
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Presence requested')
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
