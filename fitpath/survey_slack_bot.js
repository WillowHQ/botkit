
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
  token: 'xoxb-72951629217-7yrngPdCCcTC70gdq7fw9NJW',
  json_file_store: '../db/',
}).startRTM()


controller.hears(['test'], ['direct_message'], function(bot, message){
    //start a convo with the test bot
})

















controller.hears(['survey'], ['direct_message'], function(bot, message){
  console.log("yes! Survey");

  chuckConverstion(bot, message)

})


var chuckConverstion = function(bot, message){
  console.log("chuck question");
  console.log("ask1");
  bot.startConversation(message, function(err, convo){
    convo.ask("How do you fell you did last week?", function(response,convo){
      console.log("ask1 in");
      chuckAsk2(response, convo);
      convo.next();

    })
  })
}

var chuckAsk2 = function(response, convo){
  console.log("Ask2");
  convo.ask("What is something you are proud of?", function(response, convo){
    console.log("ask2 in");
    chuckAsk3(response, convo);
    convo.next();
  })

}
var chuckAsk3 = function(response, convo){
  console.log("ask3");
  console.log("change");
  convo.ask("Is there anything your not happy with, that we can improve on?", function (response, convo){
    console.log('ask3 in');

    //send a post to db for info
    console.log('Entering building reminder');
    question1(response, convo);
    convo.next();


  })


}





controller.hears(['reminder'],['direct_message'],function(bot,message) {
  console.log("yes!");


  console.log(bot.botkit.storage.users);
  console.log(message);
  reminderConverstion(bot, message);

});




var reminderConverstion = function(bot, message){
  bot.startConversation(message, function(err, convo){
    console.log('here');
    convo.say("Josh is the best!")
    convo.ask("Would you like to make a reminder?",

    [
      {
        pattern: bot.utterances.yes, //stuck on yes
        callback: function(response, convo){
          convo.say("Great! I will continue...");
          question1(response, convo);
          convo.next();
        }
      },
      {
        pattern: bot.utterances.no,
        callback: function(response, convo){
          convo.say('Have a good day!');
          convo.next();
        }
      },
      {
        default: true,
        callback: function(response, convo){
          convo.say("Yes or No")
          convo.repeat();
          convo.next();
        }
      }

    ]
    )

  });
};

var options = function (response, convo) {
  console.log("options");
  convo.ask("Would you like to make a reminder?",

  [
    {
      pattern: bot.utterances.yes, //stuck on yes
      callback: function(response, convo){
        convo.say("Great! I will continue...");
        question1(response, convo);
        convo.next();
      }
    },
    {
      pattern: bot.utterances.no,
      callback: function(response, convo){
        convo.say('Have a good day!');
        convo.next();
      }
    },
    {
      default: true,
      callback: function(response, convo){
        convo.say("Yes or No")
        convo.repeat();
        convo.next();
      }
    }

  ]
  )
}

var question1 = function(response, convo){
  console.log("ask1");
  convo.ask("What do you want your reminder to say?", function(response, convo){
    convo.say("Awesome");
    question2(response, convo);
    convo.next();
  },{key:"body"});

};


var question2 = function(response, convo){
  console.log('ask2');
  convo.ask("What time of day?(24 hours) hh:mm", function(response, convo){
    //if statment checking if the time was rightly formated

    convo.say("Awesome");
    question3(response, convo);
    convo.next();
  },{key:"time"});
};

var question3 = function(response, convo){
  console.log('ask3');
  convo.ask("What days of the week?\n sun,mon,tues,wed,thurs,fri,sat \n Order matters \n Ex: mon,wed,sat", function(response, convo){
    console.log("in ask3");
    convo.say("Awesome");
    convo.say("Bye");
    console.log(response);
    console.log(response.text);
    //err checking


    endReminder(response, convo);
    convo.next();

  },{key:"week"})

}


var endReminder = function (response, convo) {
  convo.on('end',function(convo) {

    if (convo.status=='completed') {
      // do something useful with the users responses
      var res = convo.extractResponses();
      console.log(res);
      console.log("sadas");

      //ok now format the responses
      //sendResponses(res, convo.convoObject.userContactInfo.slack_Id);
      //submitResponse(res, convo);

      // reference a specific response by key

      sendOutReminder(res, convo, response);
      // ... do more stuff...

    } else {
      console.log("error");
      // something happened that caused the conversation to stop prematurely
    }

  });

}


var sendOutReminder = function(res, convo, response){
  console.log("sendOutReminder");

  var days1 = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

  var dates = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
  };

  var days = [];
  var selectedDays = [];
  // var hour = this.time.getHours();
  // var minute = this.time.getMinutes();

  var hour = res.time.slice(0,2);
  var min = res.time.slice(3, 5);
  console.log(hour);
  console.log(min);
  console.log(res.time);

  if (res.week.indexOf('sun') != -1) {
      dates.sunday = true;
      selectedDays.push('Sun');
      days.splice(days1.length,0,0);
  }
  if (res.week.indexOf('mon') != -1) {
      dates.monday = true;
      selectedDays.push('Mon');
      days.splice(days1.length,0,1);
  }
  if (res.week.indexOf('tues') != -1) {
      dates.tuesday = true;
      selectedDays.push('Tues');
      days.splice(days1.length,0,2);
  }
  if (res.week.indexOf('wed') != -1) {
      dates.wednesday = true;
      selectedDays.push('Wed');
      days.splice(days1.length,0,3);
  }
  if (res.week.indexOf('thurs') != -1) {
      dates.thursday = true;
      selectedDays.push('Thurs');
      days.splice(days1.length,0,4);
  }
  if (res.week.indexOf('fri') != -1) {
      dates.friday = true;
      selectedDays.push('Fri');
      days.splice(days1.length,0,5);
  }
  if (res.week.indexOf('sat') != -1) {
      dates.saturday = true;
      selectedDays.push('Sat');
      days.splice(days1.length,0,6);
  }

  console.log("selected days");
  console.log(selectedDays);





  console.log("dates");
  console.log(dates);
  console.log("days");
  console.log(days);
  console.log("convo");
  // console.log(convo.conversation.task.Task.Botkit.source_message.user);
  console.log("res");
  console.log(res);
  console.log(response.user);
  request('http://localhost:12557/api/user/slackId/' + response.user, function (error, response, body) {
    if (!error && response.statusCode == 200) {

      console.log(JSON.parse(body));  // just print out evertything we get back from this api call
      console.log("we didn't completely fuck up yet");
      var user = JSON.parse(body);
      console.log('user');
      console.log(user);

      console.log("mintue");
      console.log(min);
      var reminder = {
        author: user._id,
        assignee: user._id,
        title: res.body,
        hour: hour,
        minute: min,
        days: days,
        daysOfTheWeek: dates,
        selectedDates: selectedDays
      }
      console.log(reminder);



      request.post({url: 'http://' + config.serverIp + ':12557/api/reminder/create', json: true, body: reminder}, function (err, response, body) {
        if(err){
          console.log("crap");
          console.log(err);
        }
        else{
          console.log("response");
          console.log(response.body);


          var reminderUserAssign = {
            repeat: true,
            days: reminder.days,
            hour: reminder.hour,
            minute: reminder.minute,
            userId: reminder.assignee,
            reminderId: response.body._id,
            type: 'reminder' // Default is reminder but there's no harm in specifying it here
          };

          console.log(reminderUserAssign);

          request.post({url: 'http://' + config.serverIp + ':12557/api/assignment/create', json: true, body: reminderUserAssign}, function(err, response, body){
            if(err){
              console.log("crap2");
              console.log(err);
            }
            else{
              console.log(response);
              console.log(":) :)");
            }

          })

        }

      });


    }
    else {
      console.log(error);
    }
  })




  // var reminder = {
  //     _id: this._id,
  //     title: this.reminder,
  //     days: days,
  //
  //     // Will this be set to server time or user's local time?
  //     //toLocaleTimeString(),
  //     timeOfDay: this.time,
  //     hour: hour,
  //     minute: minute,
  //     selectedDates: this.selectedDays,
  //     daysOfTheWeek: dates,
  //     author: this.author,
  //     assignee: this.assignee,
  //     responses: this.responses
  //
  // };


  var reminder = {
    title: res.body,

  }





}






module.exports.receiveConvo = function(convo){


  var convoObject = convo;

  var ask1 = function(response, convo){
    console.log('508: ' + JSON.stringify(convoObject));
    convo.convoObject = convoObject;

    if(convo.convoObject.questions[0]){
      console.log("past if");
      console.log(convo.convoObject.questions[0]);
      convo.ask(convo.convoObject.questions[0].question, function(response, convo) {

        console.log("ask2 start here");

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

  var ask2 = function(response, convo){
    console.log("ask2");
    if(convo.convoObject.questions[1]){
      console.log("past if");

      convo.ask(convo.convoObject.questions[1].question, function(response, convo) {

        ask3(response, convo);
        convo.next();
      });

    }else{
      convo.say("Bye");
      closeSurvey(response,convo);
      convo.next();
    }

  }

  var ask3 = function(response, convo){
    console.log("ask3");
    if(convo.convoObject.questions[2]){
      console.log("past if");

      convo.ask(convo.convoObject.questions[2].question, function(response, convo) {

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
    if(convo.convoObject.questions[3]){
      console.log("past if");

      convo.ask(convo.convoObject.questions[3].question, function(response, convo) {

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
    if(convo.convoObject.questions[4]){
      console.log("past if");

      convo.ask(convo.convoObject.questions[4].question, function(response, convo) {

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
        sendResponses(res, convo.convoObject.userContactInfo.slack_Id);
        submitResponse(res, convo);

        // reference a specific response by key
        //var value  = convo.extractResponse('key');

        // ... do more stuff...

      } else {
        // something happened that caused the conversation to stop prematurely
      }

    });

  }
  submitResponse = function(res, convo) {
    var response = {};
    response.assignment = convo.convoObject.assignmentId;
    response.userId = convo.convoObject.userId;
    response.timeStamp = Date.now();
    // if(typeof convo.convoObject.surveyTemplateId !== 'undefined' && variable !== null){
    //   response.surveyTemplateId = convo.convoObject.surveyId;}
    // else if(typeof convo.convoObject.reminderId !== 'undefined' && variable !== null) {response.reminderId = convo.convoObject.surveyId;}
    //
    if(convo.convoObject.type && convo.convoObject.type === 'survey'){
        console.log('server');
        console.log(convo.convoObject.surveyId);
        response.surveyTemplateId = convo.convoObject.surveyId;
    }
    else if (convo.convoObject.type && convo.convoObject.type === 'reminder'){
      console.log('server');
      console.log(convo.convoObject.reminderId);
      response.reminderId = convo.convoObject.reminderId;
    }



    response.questions = [];
    for (var i = 0; i < convo.convoObject.questions.length; i++) {
      var question = convo.convoObject.questions[i].question;
      console.log('Question: ' + question);
      // Responses are indexed by the question as a key
      console.log('Response: ' + response);
      // Push the response onto the responseArray
      //responseArray.push(response);
      response.questions[i] = convo.convoObject.questions[i];
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


  console.log(convoObject.userContactInfo.slackId);
  console.log(convoObject.type);
  bot.startConversation({user: 'U24TDF6AC', channel: 'C24TNEECF'}, ask1);


}
