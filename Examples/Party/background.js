var extensionId = "ibpbmghbpjpjookgdkehfmfhnapijmeh"; //Chrome
if(typeof browser !== 'undefined' && typeof chrome !== "undefined"){
  extensionId = "{57081fef-67b4-482f-bcb0-69296e63ec4f}"; //Firefox
}

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if(typeof request.action === 'undefined' || request.action == "presence") {
    //Pass request to content script.
    chrome.tabs.sendMessage(request.tab, request.info, function(response){
      sendResponse(response);
    });
  }else if(request.action == "join"){
    //Game launch request.
    chrome.tabs.create({url: 'https://www.twitch.tv/'+request.secret}, function (tab) {
    });
  }
  return true;
});

//Register party listener. Needed for reacting to invitations
chrome.runtime.sendMessage(extensionId, {action: 'party', clientId: '611467991938367518'}, function(response) {
  console.log('Party registred', response);
});
