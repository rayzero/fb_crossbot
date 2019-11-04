const login = require("facebook-chat-api");
var schedule = require('node-schedule');

// Create simple echo bot
login({email: "nkhurht_fergieman_1572846106@tfbnw.net", password: "k8e52pckcig"}, (err, api) => {
    if(err) return console.error(err);

    // testing api @ https://github.com/node-schedule/node-schedule
    // doesn't support timezones, need to see if aws server can set correct timezone
	var j = schedule.scheduleJob('44 * * * *', function(){
	  api.sendMessage("HELLO NAM", 100043380422247);	
	  console.log('The answer to life, the universe, and everything!');
	});

});
