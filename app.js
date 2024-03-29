const fs = require("fs");
const login = require("facebook-chat-api");
var schedule = require('node-schedule');

var time_parser = require('./time_parser.js');
var utils = require('./utils.js');


// map each person's name to their time in int (for sorting) and string (for printing)
// times = { <name>: { time_in_s: <seconds>, time_str: <str_to_print> }, <name2>: { time_in_s: <seconds>, time_str: <str_to_print> }, .. ]
var LEADERBOARD = {};
var GROUP_CHAT_ID = 2046477035465947;

function updateTimes(id, name, time_in_s, time_str) {
    LEADERBOARD[id] = {
        'name': name,
        'time_in_s': time_in_s,
        'time_str': time_str
    }
}

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
	if(err) return console.error(err);

    // restore leaderboard if valid time
    if (utils.validTime()) {
        try {
            LEADERBOARD = JSON.parse(fs.readFileSync('leaderboard.json', 'utf8'))
        } catch(err) {
            LEADERBOARD = {}
        }
    }

	console.log( "Waiting for message\n" );

    // scheduler to print times at leaderboard close
    var leaderboardClosed = schedule.scheduleJob({rule:'0 12 * * *', tz:'America/Los_Angeles'}, function(){
        printLeaderboard(api, GROUP_CHAT_ID)
        console.log("clearing time dictionary")
        LEADERBOARD = {}
    });

	api.listenMqtt((err, message) => {
		if (!message || !message.body) {
            return;
		}
        console.log(message.body)
        handleMessage(message, api);
	});
});

['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach((eventType) => {
    process.on(eventType, onExit);
})

function onExit() {
    fs.writeFileSync("leaderboard.json", JSON.stringify(LEADERBOARD))
}

// handles different functions based off what messsage is read in
function handleMessage(message, api) {
    var threadID = message.threadID;
    if( message.body == "/times" )
    {
        console.log( "Request to show leaderboard\n" );
        printLeaderboard(api, threadID);
        return;
    }
    else if ( message.body == "/help" )
    {
        console.log( "Request to show help screen\n" );
        printHelpScreen( api, threadID );
    } else if ((message.body).toLowerCase() == "dnf") {
        getName(api, message.senderID, (name) => {
            updateTimes(message.senderID, name, Number.MAX_SAFE_INTEGER, "dnf")
        })
    }
    if (!utils.validTime()) {
        console.log( "Received invalid time\n");
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

function printHelpScreen( api, threadID )
{
    help_string = "General Rules\n \
    - Post a message with only your time between 12pmPST - 7pmPST to record it\n \
    - You can update your time in case of a mistake\n \
    - Type '/times' to view the current leaderboard\n\n \
    Example inputs:\n \
    '123' --> valid\n \
    '1:23' --> valid\n \
    ':23' --> valid\n \
    '23' --> valid\n \
    '123 bad' --> invalid\n";
    api.sendMessage({body: help_string}, threadID);

}
