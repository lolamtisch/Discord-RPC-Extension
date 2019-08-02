const discord = require('./Server/presence');

discord.send('180984871685062656', {
  state: 'slithering',
  details: '🐍',
  startTimestamp: Date.now(),
  largeImageKey: 'snek_large',
  smallImageKey: 'snek_small',
  instance: true,
});

setTimeout(() => {
  console.log('Switch')
  discord.send('606504719212478504', {
    state: 'slithering',
    details: '🐍',
    startTimestamp: Date.now(),
    instance: true,
  });
}, 6000);

var inter = setInterval(function(){
  discord.keepAlive();
}, 1000)

timeout = setTimeout(() => {
  console.log('Kill')
  clearInterval(inter);
}, 12000);

setInterval(function(){

}, 1000)
