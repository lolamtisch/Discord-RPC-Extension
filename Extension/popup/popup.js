fillUi();
function fillUi(){
  chrome.runtime.sendMessage("", function(presence) {
    console.log('Fill Ui', presence);
    if(!presence.websocket){
      var html = '<div><b>No active connection to the server</b></div>';
    }else if(typeof presence.presence !== 'undefined' && presence.presence){
      presence = presence.presence;
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
      `;
    }else{
      var html = '<div><b>No Presence Active</b></div>';
    }

    document.getElementById('main').innerHTML = html;
  });
}
