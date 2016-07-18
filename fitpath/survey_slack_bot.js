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


//var convoObject;
var controller = Botkit.slackbot({
    json_file_store: '../db/',
    debug: false
});

var bot = controller.spawn({
  token: 'xoxb-29530029556-OmwcgKzhVDUHSa4x85eRRpba',
  json_file_store: '../db/',
}).startRTM()




module.exports.receiveConvo = function(convo){


  console.log('received Convo');
  console.log(JSON.stringify(convo));
  //, channel:'C0NGETH71'
  var convoObject = convo;



  console.log("Starting a convo");
  console.log(convoObject);

  ask1 = function(response, convo){
    console.log("ask1");


    if(convoObject.questions[0]){
      console.log("past if");

      convo.ask(convoObject.questions[0].question, function(response, convo) {

        convo.say("Awesome.");
        console.log("ask2 start here");
        console.log(convo);

        //breaking with 2 different surveys at the same time
        convo.next();
        console.log("after next");

        ask2(response, convo);

      });

    }else{
      convo.say("Bye");
      closeSurvey(response,convo);
      convo.next();
    }
  }

  ask2 = function(response, convo){
    console.log("ask2");
    if(convoObject.questions[1]){
      console.log("past if");

      convo.ask(convoObject.questions[1].question, function(response, convo) {

        convo.say("Awesome.");
        ask3(response, convo);
        convo.next();
      });

    }else{
      convo.say("Bye");
      closeSurvey(response,convo);
      convo.next();
    }

  }

  ask3 = function(response, convo){
    console.log("ask3");
    if(convoObject.questions[2]){
      console.log("past if");

      convo.ask(convoObject.questions[2].question, function(response, convo) {

        convo.say("Awesome.");
        ask4(response, convo);
        convo.next();
      });

    }else{
      convo.say("Bye");
      closeSurvey(response,convo);
      convo.next();
    }
  }

  var ask4 = function (response, convo) {
    console.log("ask4");
    if(convoObject.questions[3]){
      console.log("past if");

      convo.ask(convoObject.questions[3].question, function(response, convo) {

        convo.say("Awesome.");
        ask5(response, convo);
        convo.next();
      });

    }else{
      convo.say("Bye");
      closeSurvey(response,convo);
      convo.next();
    }

  }
  var ask5 = function(response, convo){
    console.log("ask5");
    if(convoObject.questions[4]){
      console.log("past if");

      convo.ask(convoObject.questions[4].question, function(response, convo) {

        convo.say("Awesome.");
        convo.say("Bye");
        closeSurvey(response,convo);
        convo.next();
      });

    }else{
      convo.say("Bye");
      closeSurvey(response,convo);
      convo.next();
    }

  }

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



  bot.startPrivateConversation({user:convoObject.userContactInfo.slack_Id}, ask1);


}




//  var ask1 = function(response, convo) {
//   console.log("ask1");
//
//   console.log("length:" + convoObject.questions.length);
//   if(convoObject.questions[0]){
//     console.log("past if");
//
//     convo.ask(convoObject.questions[0].question, function(response, convo) {
//
//       convo.say("Awesome.");
//       ask2(response, convo);
//       convo.next();
//     });
//
//   }else{
//     convo.say("Bye");
//     closeSurvey(response,convo);
//     convo.next();
//   }
// };

// var ask2 = function(response, convo){
//   console.log("ask2");
//   if(convoObject.questions[1]){
//     console.log("past if");
//
//     convo.ask(convoObject.questions[1].question, function(response, convo) {
//
//       convo.say("Awesome.");
//       ask3(response, convo);
//       convo.next();
//     });
//
//   }else{
//     convo.say("Bye");
//     closeSurvey(response,convo);
//     convo.next();
//   }
//
// }
//
// var ask3 = function(response, convo){
//   console.log("ask3");
//   if(convoObject.questions[2]){
//     console.log("past if");
//
//     convo.ask(convoObject.questions[2].question, function(response, convo) {
//
//       convo.say("Awesome.");
//       ask4(response, convo);
//       convo.next();
//     });
//
//   }else{
//     convo.say("Bye");
//     closeSurvey(response,convo);
//     convo.next();
//   }
// }
//
//
// var ask4 = function (response, convo) {
//   console.log("ask4");
//   if(convoObject.questions[3]){
//     console.log("past if");
//
//     convo.ask(convoObject.questions[3].question, function(response, convo) {
//
//       convo.say("Awesome.");
//       ask5(response, convo);
//       convo.next();
//     });
//
//   }else{
//     convo.say("Bye");
//     closeSurvey(response,convo);
//     convo.next();
//   }
//
// }
//
// var ask5 = function(response, convo){
//   console.log("ask5");
//   if(convoObject.questions[4]){
//     console.log("past if");
//
//     convo.ask(convoObject.questions[4].question, function(response, convo) {
//
//       convo.say("Awesome.");
//       convo.say("Bye");
//       closeSurvey(response,convo);
//       convo.next();
//     });
//
//   }else{
//     convo.say("Bye");
//     closeSurvey(response,convo);
//     convo.next();
//   }
//
// }



// module.exports.ask1 = function(response, convo) {
//   console.log("hey");
//   if(counter < convoObject.questions.length){
//
//     convo.ask(convoObject.questions[convoObject.counter++].question, function(response, convo) {
//       console.log(convoObject.counter);
//       convo.say("Awesome.");
//       ask1(response, convo);
//       convo.next();
//     });
//   } else {
//     convo.say("Bye");
//     closeSurvey(response,convo);
//     //convo.next();
//   }
// };












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


//
closeSurvey = function(response, convo) {
  convo.on('end',function(convo) {

    if (convo.status=='completed') {
      // do something useful with the users responses
      var res = convo.extractResponses();
      console.log(res);

      //ok now format the responses
      //sendResponses(res, convoObject.userContactInfo.slack_Id);
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
