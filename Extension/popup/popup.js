var api;

function fillUi(){
  chrome.runtime.sendMessage("", function(presence) {
    console.log('Fill Ui', presence);
    var domain = presence.state.tabInfo.domain;

    var blacklist = api.disabledDomains.filter(function(e) { return e !== domain });
    var blackHtml = '';
    for (var key in blacklist) {
      blackDomain = blacklist[key];
      blackHtml += `
        <button class="disable-page disabled" data-domain="${blackDomain}" title="${blackDomain}">
          <img src="https://www.google.com/s2/favicons?domain=${blackDomain}">
          <i class="i-disabled material-icons">
            not_interested
          </i>
          <i class="i-enabled material-icons">
            panorama_fish_eye
          </i>
        </button>
      `;
    }

    if(!presence.websocket){
      var html = '<div><b>No active connection to the server</b></div>';
    }else if(typeof presence.state !== 'undefined' && presence.state){
      presence = presence.state.presence;
      var time = '';
      if(typeof presence.startTimestamp !== 'undefined'){
        time = '<div>XX:XX elapsed</div>';
      }else if(typeof presence.endTimestamp !== 'undefined'){
        time = '<div>XX:XX left</div>';
      }

      var details = '';
      if(typeof presence.details !== 'undefined') details = '<div>'+presence.details+'</div>';

      var state = '';
      if(typeof presence.state !== 'undefined') state = '<div>'+presence.state+'</div>';

      var html = `
        <div><b>Playing A Game</b></div>
        ${details}
        ${state}
        ${time}
        <div class="page-config">
          ${blackHtml}
          <button class="disable-page ${(api.disabledDomains.includes(domain)) ? 'disabled' : 'enabled'}" data-domain="${domain}" title="${blackDomain}">
            <img src="https://www.google.com/s2/favicons?domain=${domain}">
            <i class="i-disabled material-icons">
              not_interested
            </i>
            <i class="i-enabled material-icons">
              panorama_fish_eye
            </i>
          </button>
        </div>
      `;
    }else{
      var html = `<div><b>No Presence Active</b><div class="page-config">${blackHtml}</div></div>`;
    }

    document.getElementById('main').innerHTML = html;
  });
}

chrome.storage.sync.get(['disabledDomains'], function(result) {
  api = result;
  if(typeof api.disabledDomains === 'undefined') api.disabledDomains = [];
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    console.log('update', changes)
    if(namespace === 'sync'){
      for (var key in changes) {
        api[key] = changes[key].newValue;
      }
    }
    fillUi();
  });
  console.log('Disabled Domains', api.disabledDomains);

  fillUi();

  function removeDomain(domain){
    api.disabledDomains = api.disabledDomains.filter(function(e) { return e !== domain })
    chrome.storage.sync.set({'disabledDomains': api.disabledDomains});
  }
  function addDomain(domain){
    api.disabledDomains.push(domain);
    chrome.storage.sync.set({'disabledDomains': api.disabledDomains});
  }
  document.addEventListener('click', function(e){
   if(e.target && e.target.classList.contains('disable-page')){
      if(e.target.classList.contains('enabled')){
        addDomain(e.target.dataset.domain);
      }else{
        removeDomain(e.target.dataset.domain);
      }
    }
  });
});
