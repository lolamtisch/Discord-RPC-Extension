chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  chrome.tabs.sendMessage(request, {}, function(response){
    sendResponse(response);
  });
});
