
// ^(?:([0-9]*):)?([0-9]*)$


// api.listen( ( err, message ) => callback )
// api.sendMessage( { <contents> }, threadID }
// api.getUserInfo( [ids], ( err, ret ) => callback )
//		name = ret[id].name

// other idea:
// mention the current leader in the write thread

// sanitize input

const login = require("facebook-chat-api");

const FB_EMAIL = "fhxbtqj_qinsky_1572845912@tfbnw.net";
const FB_PWD = "8xfjw50cvss";

login({email: FB_EMAIL, password: FB_PWD}, (err, api) => {
	if(err) return console.error(err);
	console.log( "Waiting for message\n" );
	// map each person's name to their time in int (for sorting) and string (for printing)
	// times = { <name>: { time_in_s: <seconds>, time_str: <str_to_print> }, <name2>: { time_in_s: <seconds>, time_str: <str_to_print> }, .. ]
	var times = {};

	api.listen((err, message) => {
		console.log( "Received a message\n" );

        if (!validTime()) {
            return;
        }

		if (!message || !message.body) {
            return;
		}

        handleMessage(message, times);
	});
});

// checks that we're within curday 7pm <-->curday+1 3pm so we can store a time
function validTime() {
    // todo: write logic
    return true;
}

// handles different functions based off what messsage is read in
function handleMessage(message, times) {
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

    storeLeaderboard(message, times);
}

// attempts to parse message into a time and store into our leaderboard object
function storeLeaderboard(message, times) {
    var name = "";
    var time_in_s = 0;
    var time_str = "";
    var info = { };

    name = getName( api, message.senderID );
    time_in_s = timeParser( message.body );
    time_str = timeToString( time_in_s );
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
    console.log( name + "Finished in " + time_in_s );
}

function insert(str, index, value) {
	return str.substr(0, index) + value + str.substr(index);
}

function getName( api, ID )
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
	});
	return name;

}

// regex for time parsing
function timeParser ( messageBody )
{
	var time_re = "^(?:([0-9]*):)?([0-9]*)$";
	var result = messageBody.match( time_re );
	var colon_pos =  3;
	var total = 0;

	if ( !messageBody )
	{
		console.log( "Message body has no contents\n" );
	}
	if ( !result )
	{
		console.log( "No colon present in input\n" );
		insert( messageBody, colon_pos, ':' );
		console.log( "Updated body:  " + messageBody );
		timeParser( messageBody );
	}
	else
	{
		var result_len = result.length;
		var seconds = result[result_len - 1];
		if ( !seconds )
		{
			console.log( "Bad input\n" );
			return total;
		}
		seconds = int( seconds );
		if ( seconds > 60 )
		{
			console.log( "Bad input\n" );
			return total;
		}
		var minutes = result[0];
		if ( !minutes ) total = seconds;
		minutes = int( minutes );
		total = minutes * 60 +  seconds;
	}
return total;
}

function timeToString( seconds )
{
	// Date uses MS
	var date = new Date(seconds * 1000);
	var mm = date.getUTCMinutes();
	var ss = date.getSeconds();
	if (mm < 10) {mm = "0"+mm;}
	if (ss < 10) {ss = "0"+ss;}
	return mm+":"+ss;
}

function printLeaderboard( times )
{
	return;
}
