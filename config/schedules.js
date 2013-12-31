// phased out, code moved to worker.js

'use strict';

var schedule = require('node-schedule'),
    mailer = require('./mailer'),
    config = require('./config');

var jobsDict = {};
module.exports.addJob = function(post) {
    var job = schedule.scheduleJob(post.id, post.next_reminder, function() {
        var mailOptions = {
            to: post.user.email,
            subject: "ReadAgain Reminder",
            text: post.url
        };
        mailer(mailOptions);
    });

    jobsDict[post.id] = job;
};

module.exports.removeJob = function(post) {
    delete jobsDict[post.id];
};