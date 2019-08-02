var extensionId = "londahcleefkodmnlammpkcdjekmmafj";

// Register Presence
chrome.runtime.sendMessage(extensionId, getPresence(), function(response) {
  console.log('Presence registred')
});

// Wait for presence Requests
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Presence requested')
  sendResponse(getPresence());
});

// Return Presence
function getPresence(){
  return {
    clientId: '606504719212478504',
    presence: {
      state: document.title,
      details: '🍱',
      startTimestamp: Date.now(),
      instance: true,
    }
  };
}
