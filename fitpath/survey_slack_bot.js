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

// josh U1YL1NY7Q
//thom U1YL92FJR
//var convoObject;
var controller = Botkit.slackbot({
    json_file_store: '../db/',
    debug: false
});

var bot = controller.spawn({
  token: 'xoxb-69491102357-fsuHZ6QO1p0LSwfuCMb9P6xc',
  json_file_store: '../db/',
}).startRTM()



controller.hears(['reminder'],['direct_message'],function(bot,message) {
  console.log("yes!");


  console.log(bot.botkit.storage.users);
  console.log(message);
  reminderConversation(bot, message);

});


controller.hears(['workout'], ['direct_message'], function(bot, message){
  console.log("Yes!");
  console.log("workout");
  workoutConversation(bot, message);

})

controller.hears(['path'], ['direct_message'], function(bot, message){
  console.log("path");
  console.log("");
  console.log(message.user);
  pathConversation(bot, message);

})


var pathConversation = function (bot, message) {
  console.log("pathconversation");

  request('http://localhost:12557/api/user/slackId/' + message.user, function (error, response, body) {
    if(error){
      console.log(error);
    }
    else{
      console.log("hjeu");
      var user = JSON.parse(response.body)

      console.log('help');
      console.log("here");
      request('http://localhost:12557/api/assignment/path/selectedUser/list/' + user._id, function (error, response1, body) {
        console.log("in");
        if(error){
          console.log(error);
        }
        else{
          console.log(response1);
          var assignments = JSON.parse(response1.body);


          pathStart(assignments, bot, message, user);



        }
      });
    }


  });
  //request('http:' + config.serverIp + ':12557//api/assignment/selectedUser/list/')


}

var pathStart = function (assignments, bot, message, user) {

  var assignmentLayout = [];
  var counter = 0;
  assignments.forEach(function(assignment){
    console.log(assignment);
    console.log(assignment.index);
    var log = {
      num: counter++,
      info: assignment,
      text: assignment.reminderId.title,
      year: assignment.year,
      month: assignment.month,
      date: assignment.date
    }
    assignmentLayout.push(log);

  })
  console.log(assignmentLayout);


  bot.startConversation(message, function (err, convo) {
    console.log("here");
    var output = "";
    // string.time.getFullYear() + '/' +  string.time.getMonth()  + '/' + string.time.getDate() +
    assignmentLayout.forEach(function(string){
      console.log(string.info.specificDate);
      var date = new Date(string.info.specificDate);

      output = output + "\n" + string.num + "\t" +  date +  '\t' + string.text + '\t completed: ' + string.info.completed;
      console.log(output);
    })
    console.log(output);
    var fullstring =  "Hey " + user.fullName + "! \n Here are the your reminders. \n Enter a number to complete that task and your response. \n Enter q to finish." + output;
    convo.ask(fullstring, arrayCreate(assignmentLayout, user));
  });

};
var arrayCreate = function (assignmentLayout, user){

  var arr = [];
  assignmentLayout.forEach(function (text) {

      var pat = {
        pattern: text.num.toString(),
        callback: function(response, convo){
          convo.say("Done " + text.num);
          completedByNum(text, response, convo);
          convo.repeat();
          convo.next();
        },
        key: 'response'
      }
      arr.push(pat);
  })
  var pat = {
    pattern: new RegExp(/^(q|Q)/i),
    callback: function (response, convo) {
      convo.say("Have a good day!");
      updatedList(convo, response, user, assignmentLayout)
      convo.next();
    }
  }
  arr.push(pat)
  var d = {
    default: true,
    callback: function (response, convo) {
      convo.say("What was that? \n Commands are q or the numbers in the list.")
      convo.repeat();
      convo.next();
    }
  }
  arr.push(d);
  console.log(arr);
  return arr;


}




var completedByNum = function (text, response, convo) {

  var addDays = function(date, days){
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    console.log("date");
    console.log(result);
    return result;
  }
  var nextWeek = addDays(text.info.specificDate, 7);
  var yearNext = nextWeek.getFullYear();
  var monthNext = nextWeek.getMonth();
  var dateNext= nextWeek.getDate();
  var hoursNext = nextWeek.getHours();
  var minutesNext = nextWeek.getMinutes();


  if(text.info.completed !== true && text.info.sent !== true){
    console.log("text.info");
    console.log(text.info);
    console.log(response.match.input);
    var answer = response.match.input.slice(1, response.match.input.length);
    console.log(answer);

    var sentResponse = {
      type: 'reminder',
      timeStamp: new Date(),
      assignment: text.info._id,
      userId: text.info.userId,
      reminderId: text.info.reminderId._id,
      questions: [
        {
          question: text.info.reminderId.title,
          type: 'WRITTEN',
          answer: answer
        }
      ]
    }
    console.log(sentResponse);

    request({url: 'http://localhost:12557/api/response/create', method: "POST", json: true, body: sentResponse }, function(err, response){
      if(err){
        console.log("crap");
        console.log(err);
      }
      else{
        console.log("sweet");
        console.log(response.body);

        if(text.info.repeat){
          var reminderUserAssign = {
            repeat: text.info.repeat,
            specificDate: nextWeek,
            year: yearNext,
            month: monthNext,
            date: dateNext,
            hours: hoursNext,
            minutes: minutesNext,
            userId: text.info.userId,
            reminderId: text.info.reminderId._id,
            type: 'reminder'
          }
          console.log(reminderUserAssign);

          console.log("Im heading out");
          //TODO change ip
          request({url: 'http://localhost:12557/api/assignment/create', method: "POST", headers: {"content-type": "application/json"}, json: reminderUserAssign}, function (err, response, body) {
            console.log("sweet");
            if(err){
              console.log("ERROR");
              console.log(err);
            }
            else {
              console.log('response');
              console.log(response.statusCode);
            }
          });

        }
      }

    })
  }
  request({url: 'http://localhost:12557/api/assignment/sent/update/' + text.info._id, method: "PUT"}, function(err, response){
    console.log("sweet 2");
    if(err){
      console.log("error");
      console.log(err);
    }
    else{
      console.log('response');
      console.log(response.statusCode);
    }
  });



  request({url: 'http://localhost:12557/api/assignment/completed/update/'+  text.info._id, method:"PUT"}, function(err, response){
    console.log("sweet 2");
    if(err){
      console.log("error");
      console.log(err);
    }
    else{
      console.log('response');
      console.log(response.statusCode);
    }
  });

}


var updatedList = function (convo, response, user, assignmentLayout) {
  console.log(user.id);




  request('http://localhost:12557/api/assignment/path/selectedUser/list/' + user.id , function (error, response1, body) {
    console.log("in");
    if(error){
      console.log('error');
      console.log(error);
    }
    else{
      console.log(response1.body);
      var assignments = JSON.parse(response1.body);
      var output = "";

      var assignmentLayout = [];
      var counter = 0;
      assignments.forEach(function(assignment){
        console.log(assignment);
        console.log(assignment.index);
        var log = {
          num: counter++,
          info: assignment,
          text: assignment.reminderId.title,
          year: assignment.year,
          month: assignment.month,
          date: assignment.date
        }
        assignmentLayout.push(log);

      })
      console.log(assignmentLayout);

      assignmentLayout.forEach(function (string) {
        var date = new Date(string.info.specificDate);



        output = output + "\n" + string.num + "\t" +  date +  '\t' + string.text + '\t completed: ' + string.info.completed;
        console.log(output);

      })
      convo.say("Updated List \n" + output);
      endPath(response, convo);
      convo.next();
    }
  });


}

var endPath = function (response, convo) {
  convo.on('end',function(convo) {

    if (convo.status=='completed') {
      // do something useful with the users responses
      console.log("done");

    }
    else{
      console.log('err');

    }
  });

}










var reminderConversation = function(bot, message){
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


  // var reminder = {
  //   title: res.body,
  //
  // }





}






module.exports.receiveConvo = function(convo){


  console.log('received Convo');
  console.log(JSON.stringify(convo));
  //, channel:'C0NGETH71'
  var convoObject = convo;



  console.log("Starting a convo");
  console.log(convoObject);

  var ask1 = function(response, convo){
    console.log("ask1");
    convo.convoObject = convoObject;

    if(convo.convoObject.questions[0]){
      console.log("past if");
      console.log(convo.convoObject.questions.length);
      if(convo.convoObject.questions.length > 1){
        console.log('in 1');
        convo.ask(convo.convoObject.questions[0].question, function(response, convo) {

          convo.say("Awesome.");
          console.log("ask2 start here");
          console.log(convo);

          //breaking with 2 different surveys at the same time
          convo.next();
          console.log("after next");

          ask2(response, convo);

        });
      }
      else if(convo.convoObject.questions[0] && convo.convoObject.type === 'reminder'){

        convo.ask(convo.convoObject.questions[0].question,

          [
            {
              pattern: bot.utterances.yes, //stuck on yes
              callback: function(response, convo){
                convo.say("Great work, keep it up! Reporting your progress to FitPath asap! :)");
                closeSurvey(response,convo);
                convo.next();
              }
            },
            {
              pattern: bot.utterances.no,
              callback: function(response, convo){
                convo.say('You’ll get em next time!');
                closeSurvey(response,convo);
                convo.next();
              }
            },
            {
              default: true,
              callback: function (response, convo) {
                convo.say("I’m a bot so I don’t know what you just said, but I’ll go ask a human and they will follow up!");
                closeSurvey(response,convo);
                convo.next();
              }

            }

          ]
          )
      }
      else if(convo.convoObject.questions[0] && convo.convoObject.type === 'survey'){
        console.log('in 1');
        convo.ask(convo.convoObject.questions[0].question, function(response, convo) {

          convo.say("Awesome.");
          console.log("ask2 start here");
          console.log(convo);

          //breaking with 2 different surveys at the same time
          convo.next();
          console.log("after next");

          ask2(response, convo);

        });
      }

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

  var ask3 = function(response, convo){
    console.log("ask3");
    if(convo.convoObject.questions[2]){
      console.log("past if");

      convo.ask(convo.convoObject.questions[2].question, function(response, convo) {

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
    if(convo.convoObject.questions[3]){
      console.log("past if");

      convo.ask(convo.convoObject.questions[3].question, function(response, convo) {

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
    if(convo.convoObject.questions[4]){
      console.log("past if");

      convo.ask(convo.convoObject.questions[4].question, function(response, convo) {

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


  console.log(convoObject.userContactInfo.slack_Id);
  console.log(convoObject.type);
  bot.startPrivateConversation({user:convoObject.userContactInfo.slack_Id}, ask1);


}
