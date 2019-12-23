chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if(request.action == "presence") {
    chrome.tabs.sendMessage(request.tab, request.info, function(response){
      sendResponse(response);
    });
  }
  return true;
});
