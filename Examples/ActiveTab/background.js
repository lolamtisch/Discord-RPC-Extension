chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  chrome.tabs.sendMessage(request.tab, request.info, function(response){
    sendResponse(response);
  });
  return true;
});
