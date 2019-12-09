// const login = require("facebook-chat-api");
// const fs = require("fs");
// const readline = require("readline");

// const FB_EMAIL = "normanmarsh916@outlook.com";
// const FB_PASSWORD = "~yKV*Mymy^nVd.9D-J&Wce3V";

// var rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// login({email: FB_EMAIL, password: FB_PASSWORD}, (err, api) => {
//     if(err) {
//         switch (err.error) {
//             case 'login-approval':
//                 console.log('Enter code > ');
//                 rl.on('line', (line) => {
//                     err.continue(line);
//                     rl.close();
//                 });
//                 break;
//             default:
//                 console.error(err);
//         }
//         return;
//     }

//     fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
// });

const fs = require("fs");
const login = require("facebook-chat-api");

// const FB_EMAIL = "nkhurht_fergieman_1572846106@tfbnw.net";
// const FB_PASSWORD = "ugxqev6g62y";
const FB_EMAIL = "ritajohnson571@outlook.com";
const FB_PASSWORD = "Crosswordrita1";

login({email: FB_EMAIL, password: FB_PASSWORD}, (err, api) => {
// login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) {
        switch (err.error) {
            case 'login-approval':
                console.log('Enter code > ');
                rl.on('line', (line) => {
                    err.continue(line);
                    rl.close();
                });
                break;
            default:
                console.error(err);
        }
        return;
    }
    fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));

    // Here you can use the api
    // api.listenMqtt((err, message) => {
    // 	if (!message) {
    // 		return
    // 	}
    //     api.sendMessage(message.body, message.threadID);
    // });
});
