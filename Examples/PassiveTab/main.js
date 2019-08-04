var extensionId = "ibpbmghbpjpjookgdkehfmfhnapijmeh";

// Register Presence
chrome.runtime.sendMessage(extensionId, {mode: 'passive'}, function(response) {
  console.log('Presence registred')
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
          state: document.getElementsByClassName('playbackSoundBadge__titleContextContainer')[0].firstElementChild.textContent,
          details: 'Paused',
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


