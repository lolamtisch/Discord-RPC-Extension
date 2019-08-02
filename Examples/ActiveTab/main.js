var extensionId = "londahcleefkodmnlammpkcdjekmmafj";

// Make a simple request:
chrome.runtime.sendMessage(extensionId, {getTargetData: true}, function(response) {
  console.log('Presence registred')
  //if (targetInRange(response.targetData)) chrome.runtime.sendMessage(laserExtensionId, {activateLasers: true});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Presence requested')
  sendResponse({
    clientId: '606504719212478504',
    presence: {
      state: document.title,
      details: '🍱',
      startTimestamp: Date.now(),
      instance: true,
    }
  });
});
