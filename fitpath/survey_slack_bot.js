/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
          \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
           \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/
This is a sample Slack bot built with Botkit.
This bot demonstrates a multi-stage conversation
# RUN THE BOT:
  Get a Bot token from Slack:
    -> http://my.slack.com/services/new/bot
  Run your bot from the command line:
    token=<MY TOKEN> node demo_bot.js
# USE THE BOT:
  Find your bot inside Slack
  Say: "pizzatime"
  The bot will reply "What flavor of pizza do you want?"
  Say what flavor you want.

  The bot will reply "Awesome" "What size do you want?"
  Say what size you want.
  The bot will reply "Ok." "So where do you want it delivered?"

  Say where you want it delivered.

  The bot will reply "Ok! Good by."

  ...and will refrain from billing your card because this is just a demo :P
# EXTEND THE BOT:
  Botkit is has many features for building cool and useful bots!
  Read all about it here:
    -> http://howdy.ai/botkit
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var Botkit = require('../lib/Botkit.js');
var moment = require('moment');
var responses = [];
var index = 0;
var dndStatus = [];
var production = false;
var thom = 'U0M4AB3M0';
var newUser = [];

//set this flag to a process.env.debug flag prob

var config = require('./env.js');
var request = require('request');

var counter = 0;
var _ = require('underscore');

// var convoObject =
//   {
//     userId: '5784f67bf87bfc21174bc93f',
//     userMedium: 'slack',
//     userContactInfo: {name: 'jlaver', slackId: 'U136W8M0W'},
//     questions: [
//       'Do you like pancakes?',
//       'Do you like waffles?',
//       'Do you like french toast?'
//     ],
//     surveyId: '35435436afaf',
//     type: 'survey'
// };



//console.log(config.phoneNumber);

var controller = Botkit.slackbot({
    json_file_store: '../db/',
    debug: false
});

var bot = controller.spawn({
  token: 'xoxb-29530029556-OmwcgKzhVDUHSa4x85eRRpba',
  json_file_store: '../db/',
}).startRTM()

var convoObject;




module.exports.receiveConvo = function(convo){
  console.log('received Convo');
  console.log(JSON.stringify(convo));
  //, channel:'C0NGETH71'
  convoObject = convo;
  console.log("heabhb");
  console.log(convoObject);
  console.log("asdjasd");
  bot.startPrivateConversation({user:convoObject.userContactInfo.slack_Id}, ask1);


}
























// // bot.startConversation({channel: '+15064706220', user: '+15064706220', text: ''}, function (err, convo) {
// //     convo.say('Hello!');
// //     convo.ask('What is your name?', function (res, convo) {
// //       convo.say(`Nice to meet you, ${res.text}!`);
// //       console.log(res.text);
// //       convo.next();
// //     });
// // });
//
// // controller.hears('.*', 'message_received', function (bot, message) {
// //   bot.reply(message, 'Sorry, my programmer was too lazy to come up with a response for that.');
// // });
// //
// //
// //
// controller.hears('s','direct_message',  function (bot, message) {
//   console.log('received convo');
//
//   console.log(JSON.stringify(convoObject));
//   counter = 0;
//   launchConvo();
//   //bot.startConversation(message, ask1);
//   //bot.startPrivateConversation({user: convoObject.userContactInfo.slackId}, ask1);
// });

// launchConvo = function(convoObject1){
//   console.log('here');
//   bot.startPrivateConversation({user: convoObject.userContactInfo.slackId}, ask1);
// }

ask1 = function(response, convo) {
  console.log("hey");
  if(counter < convoObject.questions.length){

    convo.ask(convoObject.questions[counter++].question, function(response, convo) {
      convo.say("Awesome.");
      ask1(response, convo);
      convo.next();
    });
  } else {
    convo.say("Bye");
    closeSurvey(response,convo);
    //convo.next();
  }
};
//
closeSurvey = function(response, convo) {
  convo.on('end',function(convo) {

    if (convo.status=='completed') {
      // do something useful with the users responses
      var res = convo.extractResponses();
      console.log(res);

      //ok now format the responses
      sendResponses(res, convoObject.userContactInfo.slack_Id);
      submitResponse(res);

      // reference a specific response by key
      //var value  = convo.extractResponse('key');

      // ... do more stuff...

    } else {
      // something happened that caused the conversation to stop prematurely
    }

  });

}
submitResponse = function(res) {
  var response = {};
  response.assignment = convoObject.assignmentId;
  response.userId = convoObject.userId;
  response.timeStamp = Date.now();
  if(typeof convoObject.surveyTemplateId !== 'undefined' && variable !== null){
    response.surveyTemplateId = convoObject.surveyId;}
  else if(typeof convoObject.reminderId !== 'undefined' && variable !== null) {response.reminderId = convoObject.surveyId;}

  response.questions = [];
  for (var i = 0; i < convoObject.questions.length; i++) {
    var question = convoObject.questions[i].question;
    console.log('Question: ' + question);
    // Responses are indexed by the question as a key
    console.log('Response: ' + response);
    // Push the response onto the responseArray
    //responseArray.push(response);
    response.questions[i] = convoObject.questions[i];
    response.questions[i].answer = res[question];
    console.log(response.questions[i].answer);
  }

  request.post({url: 'http://' + config.serverIp + ':12557/api/response/create', json: true, body: response}, function (err, response, body) {
    console.log(err);
    console.log(response.questions);
    console.log(body);
  });

}



function sendResponses(response, id){
  var responses = surveyResponseToString(response);
  console.log('sned Responses');
  var attachments = {
    'username': 'survey',
    'channel': 'C0NGETH71',
    'attachments': [
      {
        'text': responses,
        'color': '#81C784',
        'title': '<@' + id + '>' + ' has completed their weekly survey!',
        'fallback': '<@' + id + '>' + ' has completed their weekly survey!',
        'mrkdwn_in' : [
          'text',
          'title',
          'fallback'
        ]
      }
    ],
    'icon_url': 'https://i.imgsafe.org/1b33b2f.png'
  }
  console.log(attachments);
  bot.say(attachments);
}

function surveyResponseToString(surveyObj) {

  var result = _.reduce(surveyObj, function(output, item, key, surveyObj) {
    if (key === Object.keys(surveyObj)[1]) {
     output = "*" + Object.keys(surveyObj)[0] + "*: " + output + "\n";
    }
    return output + "*" + key + "*: " + item + "\n";

  });
  return result;
}




//   if(convoObject.type == 'survey') {
//     bot.startConversation({message, function (bot, message) {
//
//         bot.say('Hi! Here\'s a survey your coach wanted me to send you.');
//         for (var i = 0; i < convoObject.questions.length; i++) {
//           console.log(convoObject.questions[i].question);
//           convo.ask(convoObject.questions[i].question, function (res, convo) {
//             console.log(res.text);
//             convo.next();
//           });
//         }
//
//       convo.say('Thanks for answering my questions. Enjoy the rest of your day ' + String.fromCodePoint(128578));
//       }
//     })
//   }
//
//
// });
//
//
//


//       convo.on('end', function (convo) {
//         if (convo.status == 'completed') {
//           console.log();
//           console.log('ended');
//           console.log();
//           var responses = convo.extractResponses();
//           console.log('Responses: ' + responses);
//
//           var responseArray = [];
//           // In order to send responses back as an array in the right order, loop through questions array
//           var response = {};
//           response.assignment = convoObject.assignmentId;
//           response.userId = convoObject.userId;
//           response.surveyTemplateId = convoObject.surveyId;
//           response.questions = [];
//
//           for (var i = 0; i < convoObject.questions.length; i++) {
//             var question = convoObject.questions[i].question;
//             console.log('Question: ' + question);
//             // Responses are indexed by the question as a key
//             console.log('Response: ' + response);
//             // Push the response onto the responseArray
//             //responseArray.push(response);
//             response.questions[i] = convoObject.questions[i];
//             response.questions[i].answer = responses[question];
//           }
//           console.log("Shouldn't leave this loop until convo is over ");
//
//           request.post({url: 'http://' + config.serverIp + ':12557/api/response/create', json: true, body: response}, function (err, response, body) {
//             console.log(err);
//             console.log(response);
//             console.log(body);
//           });
//         }
//
//     } else {
//       console.log("type is broken");
//     }
//
//       // Must be a reminder
//
//
// };
// module.exports.receiveReminder = function (convoObject) {
//   convo.ask(convoObject.questions[0], function (res, convo) {
//     console.log('121: ' + res.text);
//     console.log('122: ' + JSON.stringify(convoObject));
//     var response = {};
//     response.type = 'reminder';
//     response.assignment = convoObject.assignmentId;
//     response.userId = convoObject.userId;
//     response.reminderId = convoObject.reminderId;
//     response.questions = [];
//     response.questions[0] = {};
//     response.questions[0].header = convoObject.questions[0];
//     response.questions[0].question = convoObject.questions[0];
//     response.questions[0].type = 'WRITTEN',
//     response.questions[0].answer = res.text;
//     console.log('133: ' + JSON.stringify(response));
//     request.post({url: 'http://' + config.serverIp + ':12557/api/response/create', json: true, body: response}, function (err, response, body) {
//       console.log('135: ' + JSON.stringify(body));
//     });
//   });
// };

// for (var i = 0; i < ConvoObjects.length; i++) {
//   var ConvoObject = ConvoObjects[i];
//   module.exports.initiateConvo(ConvoObject);
// }
