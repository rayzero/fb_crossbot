const login = require("facebook-chat-api");

// Create simple echo bot
login({email: "fhxbtqj_qinsky_1572845912@tfbnw.net", password: "8xfjw50cvss"}, (err, api) => {
    if(err) return console.error(err);
    console.log( "Waiting for message\n" );

    api.listen((err, message) => {
	console.log("Bot message: " + message);
	if (message && message.body) {
            // Getting the actual sender name from ID involves calling
            // `api.getThreadInfo` and `api.getUserInfo`
            api.sendMessage({
                body: 'Hello @Sender! @Sender!',
                mentions: [{
                     tag: '@Sender',
                     id: 100042834561933,
                     fromIndex: 9, // Highlight the second occurrence of @Sender
                }],
            }, message.threadID);

	   console.log( "Sending from: "+ message.senderID);
           api.getUserInfo([message.senderID], (err, ret) => {
        	if(err) return console.error(err);

 	        api.sendMessage( { body: ret[message.senderID].name }, message.senderID);
        	
	   });
        }
    });
});

// ^(?:([0-9]*):)?([0-9]*)$
