var time_parser = require('./time_parser.js');
const fs = require("fs");
const login = require("facebook-chat-api");
var schedule = require('node-schedule');
var moment = require('moment');

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

function compareTimes(a, b) {
    if (a.time_in_s > b.time_in_s) {
        return 1;
    } else if (a.time_in_s < b.time_in_s) {
        return -1;
    }
    return 0;
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
		console.log( "Received a message\n" );

        if (!validTime()) {
            console.log( "Received invalid time\n");
            return;
        }

		if (!message || !message.body) {
            console.log( "Received unable to parse message or message body\n");
            return;
		}

        handleMessage(message, api);
	});
});

// checks that we're within curday 7pm <-->curday+1 3pm so we can store a time
function validTime() {
    // todo: write logic
    hourOfDay = parseInt(moment().format('HH'))
    return !(hourOfDay>=12 && hourOfDay<=19)
}

// handles different functions based off what messsage is read in
function handleMessage(message, api) {
    console.log( "Sending from: " + message.senderID);
    console.log( "Message body: " + message.body );

    if ( !message.body )
    {
        console.log( "Nothing in this message...\n" );
        return;
    }
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
        parsed_time = time_parser.timeParser( message.body );
        time_in_s = parsed_time['total']

        if ( time_in_s == -1 )return;
        time_str = parsed_time['time_str']
        console.log(time_in_s)
        console.log(name)
        console.log(time_str)

        if ( !name || !time_in_s || !time_str ) {
            console.log( "Bad inputs\n" );
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
		console.log( "Found name: "+name );
		if ( !name ) {
			console.log( "Unknown sender\n");
			name = "Unknown";
		}
        cb(name)
	});
}

function printLeaderboard( api, threadID )
{
    console.log( "times:" )
    sortedTimes = []
    for (var key in LEADERBOARD) {
        value = LEADERBOARD[key]
        sortedTimes.push(value)
    }
    console.log( "sortedTimes:" )
    sortedTimes.sort(compareTimes);
    console.log( "sorted times length " + sortedTimes.length );

    leaderboardBody = ""
    for (i = 0; i < sortedTimes.length; i++) {
        singleTimeStr = (i+1) + '. ' + sortedTimes[i].name +' @ ' + sortedTimes[i].time_str + '\n'
	console.log( singleTimeStr );
        leaderboardBody += singleTimeStr
    }
    disclaimer = "Scoreboard closes at noon Pacific Time, and opens for the next day at 7pm."
    leaderboardBody += disclaimer

    api.sendMessage({body: leaderboardBody}, threadID)
	return;
}
