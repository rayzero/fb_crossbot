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
		// seconds = int( seconds );
		if ( seconds > 60 )
		{
			console.log( "Bad input\n" );
			return total;
		}
		var minutes = result[0];
		if ( !minutes ) total = seconds;
		// minutes = int( minutes );
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
