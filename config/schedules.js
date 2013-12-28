'use strict';

var schedule = require('node-schedule'),
    mailer = require('./mailer'),
    config = require('./config'),
    process = require('./post');

module.exports.addJob = function(post) {
    schedule.scheduleJob(post.id, post.next_reminder, function() {
        var mailOptions = {
            to: post.user.email,
            subject: "ReadAgain Reminder",
            text: post.url
        };
        mailer(mailOptions);
    });
};

module.exports.removeJob = function(post) {
    for(var iter = 0; iter < schedule.scheduleJobs.length; iter++) {
        var j = schedule.scheduleJobs[iter];
        if(j.name == post.id) j.cancel();
    }
};