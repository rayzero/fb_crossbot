// regex for time parsing

function insert(str, index, value) {
    return str.substr(0, index) + value + str.substr(index);
}

function timeParser( messageBody )
{	
	var time_re = "^([0-9]*):([0-9]*)$";
	var time_without_colon_re = "^([0-9]*)$";
	var result = messageBody.match( time_re );
	var result_without_colon = messageBody.match( time_without_colon_re );
	var str_len = messageBody.length;
	var colon_pos =  str_len - 2;
	// var total = 0;
	var return_obj = {
		'total': -1,
		'time_str': messageBody
	}

	if ( !messageBody )
	{
		console.log( "Message body has no contents\n" );
		return return_obj;
	}
	if ( !result && !result_without_colon )
	{
		console.log( "Normal message\n" );
		return return_obj;
	}
	if ( !result )
	{
		messageBody = insert( messageBody, colon_pos, ':' );
		return timeParser( messageBody );
	}
	else
	{
		var result_len = result.length;
		var seconds = result[result_len - 1];
		console.log( "seconds: " + seconds );
		if ( !seconds )
		{
			console.log( "Bad input\n" );
			return return_obj;
		}
		seconds = parseInt( seconds );
		if ( seconds > 60 )
		{
			console.log( "Bad input\n" );
			return return_obj;
		}
		var minutes = result[result_len - 2];
		if ( !minutes ) 
		{
			return_obj['total'] = seconds;
		}
		else 
		{
			minutes = parseInt( minutes );
			return_obj['total'] = minutes * 60 + seconds;
		}
	}
	return return_obj;
}

module.exports = 
{
	timeParser: timeParser
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
