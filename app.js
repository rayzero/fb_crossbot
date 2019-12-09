const fs = require("fs");
const login = require("facebook-chat-api");
var schedule = require('node-schedule');

var time_parser = require('./time_parser.js');
var utils = require('./utils.js');


// map each person's name to their time in int (for sorting) and string (for printing)
// times = { <name>: { time_in_s: <seconds>, time_str: <str_to_print> }, <name2>: { time_in_s: <seconds>, time_str: <str_to_print> }, .. ]
var LEADERBOARD = {};
var GROUP_CHAT_ID = 3062775780417171;

function updateTimes(id, name, time_in_s, time_str) {
    LEADERBOARD[id] = {
        'name': name,
        'time_in_s': time_in_s,
        'time_str': time_str
    }
}

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
	if(err) return console.error(err);
	console.log( "Waiting for message\n" );

    // scheduler to clear times every minute
    var j = schedule.scheduleJob('* 12 * * *', function(){
        console.log("clearing time dictionary")
        printLeaderboard(api, GROUP_CHAT_ID)
        LEADERBOARD = {}
    });

	api.listenMqtt((err, message) => {
        if (!message) {
            return
        }

        if (!util.validTime()) {
            console.log( "Received invalid time\n");
            return;
        }

		if (!message || !message.body) {
            return;
		}

        handleMessage(message, api);
	});
});

// handles different functions based off what messsage is read in
function handleMessage(message, api) {
    if( message.body == "/times" )
    {
        var threadID = message.threadID;
        console.log( "Request to show leaderboard\n" );
        printLeaderboard(api, threadID);
        return;
    }

    storeLeaderboard(message, api);
}

// attempts to parse message into a time and store into our leaderboard object
function storeLeaderboard(message, api) {
    var name = "";
    var time_in_s = 0;
    var time_str = "";
    var info = { };

    getName(api, message.senderID, (name) => {
        time_in_s = time_parser.timeParser( message.body );

        if ( time_in_s == -1 )return;
        time_str = time_parser.timeToString(time_in_s)
        console.log(time_in_s)
        console.log(name)
        console.log(time_str)

        if ( !name || !time_in_s || !time_str ) {
            console.log( "storeLeaderboard::Bad inputs\n" );
            return;
        }

        updateTimes(message.senderID, name, time_in_s, time_str)
    });
}

function getName( api, ID,  cb )
{
	var name = "";
	api.getUserInfo([ID], (err, ret) => {
		if(err) return console.error(err);
		name = ret[ID].name;
		if ( !name ) {
			console.log( "getName::Unknown sender\n");
			name = "Unknown";
		}
        cb(name)
	});
}

function printLeaderboard( api, threadID )
{
    sortedTimes = []
    for (var key in LEADERBOARD) {
        value = LEADERBOARD[key]
        sortedTimes.push(value)
    }
    sortedTimes.sort(utils.compareTimes);
    leaderboardBody = utils.generateLeaderboardString(sortedTimes)

    api.sendMessage({body: leaderboardBody}, threadID)
	return;
}
