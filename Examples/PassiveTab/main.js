var extensionId = "agnaejlkbiiggajjmnpmeheigkflbnoo"; //Chrome
if(typeof browser !== 'undefined' && typeof chrome !== "undefined"){
  extensionId = "1cf038ecb5fc74f2a6ca0811c2c14d89fc230b89@temporary-addon"; //Firefox
}

// Register Presence
chrome.runtime.sendMessage(extensionId, {mode: 'passive'}, function(response) {
  console.log('Presence registred', response);
});

// Wait for presence Requests
chrome.runtime.onMessage.addListener(function(info, sender, sendResponse) {
  console.log('Presence requested', info)
  sendResponse(getPresence(info));
});

function getPresence(info){
  function getMS(string) {
    const a = string.split(":")
    const seconds = string.split(":").length - 1 > 1  ? +a[0] * 3600 + +a[1] * 60 + +a[2] : +a[0] * 60 + +a[1]
    return seconds * 1000;
  }
  try{

    if(document.getElementsByClassName('playControl')[0].classList.contains('playing')){
      return {
        clientId: '607153108375830548',
        presence: {
          state: document.getElementsByClassName('playbackSoundBadge__titleContextContainer')[0].firstElementChild.textContent,
          details: document.getElementsByClassName('playbackSoundBadge__titleLink')[0].lastElementChild.textContent,
          startTimestamp: Date.now() - getMS(document.getElementsByClassName('playbackTimeline__timePassed')[0].lastElementChild.textContent),
          largeImageKey: "soundcloud",
          smallImageKey: "play",
          instance: true,
        }
      };
    }else if(info.active){
      return {
        clientId: '607153108375830548',
        presence: {
          state: 'Paused',
          details: document.getElementsByClassName('playbackSoundBadge__titleLink')[0].lastElementChild.textContent,
          largeImageKey: "soundcloud",
          smallImageKey: "pause",
          instance: true,
        }
      };
    }else{
      return {};
    }

  }catch(e){
    console.error(e);
    return {};
  }
}


