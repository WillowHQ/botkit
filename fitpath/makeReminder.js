/**
 * Created by matthewboudreau on 2016-08-29.
 */


//just storing the old reminder code here


var reminderConversation = function(bot, message){
    bot.startConversation(message, function(err, convo){
        console.log("here");
        //convo.say("Josh is the best!")
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
                        convo.say("Have a good day!");
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
    console.log("ask2");
    convo.ask("What time of day?(24 hours) hh:mm", function(response, convo){
        //if statment checking if the time was rightly formated

        convo.say("Awesome");
        question3(response, convo);
        convo.next();
    },{key:"time"});
};

var question3 = function(response, convo){
    console.log("ask3");
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
    convo.on("end",function(convo) {

        if (convo.status=="completed") {
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

    var days1 = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

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

    if (res.week.indexOf("sun") != -1) {
        dates.sunday = true;
        selectedDays.push("Sun");
        days.splice(days1.length,0,0);
    }
    if (res.week.indexOf("mon") != -1) {
        dates.monday = true;
        selectedDays.push("Mon");
        days.splice(days1.length,0,1);
    }
    if (res.week.indexOf("tues") != -1) {
        dates.tuesday = true;
        selectedDays.push("Tues");
        days.splice(days1.length,0,2);
    }
    if (res.week.indexOf("wed") != -1) {
        dates.wednesday = true;
        selectedDays.push("Wed");
        days.splice(days1.length,0,3);
    }
    if (res.week.indexOf("thurs") != -1) {
        dates.thursday = true;
        selectedDays.push("Thurs");
        days.splice(days1.length,0,4);
    }
    if (res.week.indexOf("fri") != -1) {
        dates.friday = true;
        selectedDays.push("Fri");
        days.splice(days1.length,0,5);
    }
    if (res.week.indexOf("sat") != -1) {
        dates.saturday = true;
        selectedDays.push("Sat");
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
    request("http://" + config.serverIp + ":12557//api/user/slackId/" + response.user, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            console.log(JSON.parse(body));  // just print out evertything we get back from this api call
            console.log("we didn't completely fuck up yet");
            var user = JSON.parse(body);
            console.log("user");
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



            request.post({url: "http://" + config.serverIp + ":12557/api/reminder/create", json: true, body: reminder}, function (err, response, body) {
                if(err){
                    console.log("crap we got an error");
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
                        type: "reminder" // Default is reminder but there"s no harm in specifying it here
                    };

                    console.log(reminderUserAssign);

                    request.post({url: "http://" + config.serverIp + ":12557/api/assignment/create", json: true, body: reminderUserAssign}, function(err, response, body){
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
