var moment = require('moment');
var tz = require('moment-timezone');


function compareTimes(a, b) {
    if (a.time_in_s > b.time_in_s) {
        return 1;
    } else if (a.time_in_s < b.time_in_s) {
        return -1;
    }
    return 0;
}

// checks that we're within curday 7pm <-->curday+1 3pm so we can store a time
function validTime() {
    // todo: write logic
    curTime = moment().tz('America/Los_Angeles')
    hourOfDay = parseInt(curTime.format('HH'))
    startHour = 19
    if (curTime.days() == 6 || curTime.days() == 7) {
        startHour = 15
    }
    return !(hourOfDay>=12 && hourOfDay<startHour)
}

function generateLeaderboardString(sortedTimes) {
    leaderboardBody = ""
    for (i = 0; i < sortedTimes.length; i++) {
        singleTimeStr = (i+1) + '. ' + sortedTimes[i].name +' @ ' + sortedTimes[i].time_str + '\n'
    console.log( singleTimeStr );
        leaderboardBody += singleTimeStr
    }
    disclaimer = "\nScoreboard closes at noon Pacific Time, and opens for the next day at 7pm."
    leaderboardBody += disclaimer

    return leaderboardBody
}

module.exports =
{
	compareTimes: compareTimes,
	validTime: validTime,
	generateLeaderboardString: generateLeaderboardString
}
