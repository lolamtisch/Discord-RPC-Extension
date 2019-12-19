var extensionId = "agnaejlkbiiggajjmnpmeheigkflbnoo"; //Chrome
if(typeof browser !== 'undefined' && typeof chrome !== "undefined"){
  extensionId = "{57081fef-67b4-482f-bcb0-69296e63ec4f}"; //Firefox
}

// Register Presence
chrome.runtime.sendMessage(extensionId, {mode: 'active'}, function(response) {
  console.log('Presence registred', response)
});

// Wait for presence Requests
chrome.runtime.onMessage.addListener(function(info, sender, sendResponse) {
  if(info.action === 'joinRequest') {
    // If request is a joinRequest then show confirm and send response
    console.log('Join Requests', info);
    if (confirm(info.user.username+'#'+info.user.discriminator+' wants to join you')) {
      sendResponse('YES');
    } else {
      sendResponse('NO');
    }
  }else{
    console.log('Presence requested', info);
    sendResponse(getPresence());
  }

});

// Return Presence
var time = Date.now()
function getPresence(){
  try{

    var type = document.querySelector('.tw-channel-status-text-indicator');
    var title = document.querySelector('.tw-font-size-4.tw-line-height-body');
    var streamer = document.querySelector('.tw-font-size-5.tw-white-space-nowrap');
    var users = document.querySelector('[data-a-target="channel-viewers-count"] .tw-stat__value');

    console.log(type.textContent, title.textContent, streamer.textContent, users.textContent);

    if(type && title && streamer) {
      return {
        clientId: '611467991938367518',
        presence: {
          state: title.textContent,
          details: streamer.textContent+' ['+users.textContent+']',
          largeImageKey: "twitch",
          smallImageKey: "live",
          partyId: "party:"+window.location.pathname.split('/')[1],
          partySize: 1,
          partyMax: 5,
          joinSecret: window.location.pathname,
          instance: true,
        }
      };
    }
  }catch(e) {
    console.error(e);
  }
  return {};
}
