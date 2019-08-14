# API
The api has two parts. The registration and presence listener. They have to be registered inside the content script. Take a look at the example extensions [Here](/Examples).

## Registration

```JS
chrome.runtime.sendMessage(extensionId, {mode: 'active'}, function(response) {
  console.log('Presence registred')
});
```
The registration is only needed to be executed once for the extension to know that the presence exists. The presence is requested every 15 seconds, but if some change happens the presence can be forced to update through calling the registration again.
### Modes
There are 2 different presence types can be registered. You have to pass it during the registration.
#### active
Use this mode if the presence is only important if the script is in the currently focused tab. 

#### passive
In this mode the presence is displayed even if the Tab is not focused (Example: music player). Active mode presences always have priority over the passive presences. If you need to handle the presence different when the tab is in focus or not. The presence listener passes if the tab is in focus.

## Presence Listener
```JS
chrome.runtime.onMessage.addListener(function(info, sender, sendResponse) {
  console.log('Presence requested', info);
  sendResponse({
    clientId: '606504719212478504',
    presence: {
      state: 'Testing',
      details: '🍱',
      startTimestamp: time,
      instance: true,
    }
  });
});
```
#### clientId
This is the Id of your discord Application. They can be created here: https://discordapp.com/developers/applications/

#### presence
Discord presence configuration more info here: https://discordapp.com/developers/docs/rich-presence/how-to#updating-presence-update-presence-payload-fields

The listener has always to return a presence, if it only misses one request it gets unregistered. If you want to keep your registration, but no presence should be displayed, then pass an empty object `{}`.

## Background Page
```JS
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  chrome.tabs.sendMessage(request.tab, request.info, function(response){
    sendResponse(response);
  });
  return true;
});
```
You need to have this in your background script. It is used to forward requests to the content script.

## Support
If you still have problems. You can drop by on my discord server [Here](https://discordapp.com/invite/cTH4yaw)
