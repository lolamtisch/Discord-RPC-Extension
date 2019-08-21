fillUi();
function fillUi(){
  chrome.runtime.sendMessage("", function(presence) {
    console.log('Fill Ui', presence);
    if(!presence.websocket){
      var html = '<div><b>No active connection to the server</b></div>';
    }else if(typeof presence.state !== 'undefined' && presence.state){
      var domain = presence.state.tabInfo.domain;
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
          <button id="disable-page" class="disable-page" data-domain="${domain}" title="Disable this page">
            <img src="https://www.google.com/s2/favicons?domain=${domain}">
            <i class="material-icons">
              not_interested
            </i>
          </button>
        </div>
      `;
    }else{
      var html = '<div><b>No Presence Active</b></div>';
    }

    document.getElementById('main').innerHTML = html;
  });
}

document.addEventListener('click', function(e){
 if(e.target && e.target.id== 'disable-page'){
    alert(e.target.dataset.domain);
  }
});
