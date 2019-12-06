
// ^(?:([0-9]*):)?([0-9]*)$


// api.listen( ( err, message ) => callback )
// api.sendMessage( { <contents> }, threadID }
// api.getUserInfo( [ids], ( err, ret ) => callback )
//		name = ret[id].name

// other idea:
// mention the current leader in the write thread

// sanitize input

const fs = require("fs");
const login = require("facebook-chat-api");

// const FB_EMAIL = "normanmarsh916@outlook.com";
// const FB_PWD = "~yKV*Mymy^nVd.9D-J&Wce3V";

// login({email: FB_EMAIL, password: FB_PWD}, (err, api) => {
login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
	if(err) return console.error(err);
	console.log( "Waiting for message\n" );
	// map each person's name to their time in int (for sorting) and string (for printing)
	// times = { <name>: { time_in_s: <seconds>, time_str: <str_to_print> }, <name2>: { time_in_s: <seconds>, time_str: <str_to_print> }, .. ]
	var times = {};

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

        handleMessage(message, times, api);
	});
});

// checks that we're within curday 7pm <-->curday+1 3pm so we can store a time
function validTime() {
    // todo: write logic
    return true;
}

// handles different functions based off what messsage is read in
function handleMessage(message, times, api) {
    console.log( "Sending from: " + message.senderID);
    console.log( "Message body: " + message.body );

    if ( !message.body )
    {
        console.log( "Nothing in this message...\n" );
        return;
    }
    if( message.body == "/" )
    {
        console.log( "Request to show leaderboard\n" );
        printLeaderboard();
        return;
    }

    storeLeaderboard(message, times, api);
}

// attempts to parse message into a time and store into our leaderboard object
function storeLeaderboard(message, times, api) {
    var name = "";
    var time_in_s = 0;
    var time_str = "";
    var info = { };

    getName(api, message.senderID, (name) => {
        time_in_s = timeParser( message.body );
        time_str = message.body;
        console.log(time_in_s)
        console.log(name)
        console.log(time_str)

        if ( !name || !time_in_s || !time_str ) {
            console.log( "Bad inputs\n" );
            return;
        }
        if ( times[name] ) {
            times[name].time_in_s = time_in_s;
            times[name].time_str = time_str;
        }
        else {
            info.time_in_s = time_in_s;
            info.time_str= time_str;
            times[name] = info;
        }
        // TODO: reinit times dict based on 20 hour period
        complete_str_to_send = name + " finished in " + time_in_s + " seconds."
        console.log(complete_str_to_send);
        api.sendMessage( { body: complete_str_to_send },  message.senderID);
    });
}

function insert(str, index, value) {
	return str.substr(0, index) + value + str.substr(index);
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
		
		api.sendMessage( { body: ret[ID].name }, ID);
        cb(name)
	});
	// return name;
}

function timeParser(timeStr) {
    pieces = timeStr.split(':')
    var minute, second;

    if(pieces.length === 2) {
        minute = parseInt(pieces[0], 10);
        second = parseInt(pieces[1], 10);
    }
    return minute*60 + second;
}

function printLeaderboard( times )
{
	return;
}
