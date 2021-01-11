var extensionId = "agnaejlkbiiggajjmnpmeheigkflbnoo"; //Chrome
if(typeof browser !== 'undefined' && typeof chrome !== "undefined"){
  extensionId = "{57081fef-67b4-482f-bcb0-69296e63ec4f}"; //Firefox
}

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if(request.action == "presence") {
    console.log('Presence requested', request);
    sendResponse(getPresence());
  }
  return true;
});

// Register Presence
chrome.runtime.sendMessage(extensionId, {mode: 'passive'}, function(response) {
  console.log('Presence registred', response)
});

// Return Presence
var time = Date.now()
function getPresence(){
  return {
    clientId: '607153108375830548',
    presence: {
      state: new Date().toLocaleString(),
      instance: true,
    }
  };
}
