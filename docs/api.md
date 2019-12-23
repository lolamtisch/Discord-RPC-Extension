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
There are 2 different presence types that can be registered. You have to pass it during the registration.
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
  if(request.action == "presence") {
    chrome.tabs.sendMessage(request.tab, request.info, function(response){
      sendResponse(response);
    });
  }
  return true;
});
```
You need to have this in your background script. It is used to forward requests to the content script.

## Party Support (Optional)

Makes it possible to create invitations in discord. People then can join that party if they have the extension installed and the browser open.

#### Registration

The client has to be connected to discord for the join button to appear in discord. This is why you need to register your clientID on the background page.

```JS
chrome.runtime.sendMessage(extensionId, {action: 'party', clientId: '606504719212478504'}, function(response) {
  console.log('Party registred', response);
});
```

Just add that for every clientId you want to support Parties for.

#### Presence
For the party to show up you need to extend your presence with atleast the partyID and joinSecret.
The partyID is only for discord to be able to detect if the users are in the same party.
When a user tries to join the joinSecret is passed from the host user. The joinSecret has to contain enought data to be able for the user to join. This is of type string. Because of security reasons I recommend to only pass the url path and just add the domain hardcoded afterwards.

#### Join request
If the user clicks on join the extension will sent out an request to your background page. There you can handle the secret in any way you need. Here I just open a new tab with it.

```JS
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if(request.action == "join"){
    //Opening a tab with domain + joinSecret
    chrome.tabs.create({url: 'https://www.twitch.tv'+request.secret}, function (tab) {
    });
  }
  return true;
});
```

#### Join Request (Even more optional)
If an user clicks that he wants join you and you have not sent out a public invitation, then discord will have a small popup if you want to allow the user to join. It is possible to handle this yes/no modal directly in your own UI. Similar to the join request above you will recive a joinRequest on the background Page. You only need to responde with 'YES'/'NO' to the request for it to be passed to Discord. You can pass this request if needed to the content script. Check the code of the example extension for more info. Note that discord not allways dispatches this request to the extension because of spam protection.

## Support
If you still have problems. You can drop by on my discord server [Here](https://discordapp.com/invite/cTH4yaw)
