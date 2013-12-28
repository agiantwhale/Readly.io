'use strict';

var mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    schedule = require('node-schedule'),
    mailer = require('./mailer'),
    config = require('./config'),
    process = require('./post');

module.exports.addJob = function(post) {
    schedule.scheduleJob(post.id, post.next_reminder, function() {
        var mailOptions = {
            to: "post.user.email",
            subject: "ReadAgain Reminder",
            text: post.url
        };
        mailer(mailOptions);
    });
};

module.exports.removeJob = function(post) {
    for(int iter = 0; iter < schedule.scheduleJobs.length; iter++) {
        var j = schedule.scheduleJobs[iter];
        j.cancel();
    }
};

module.exports.init = function() {
    Post.find({}, function(err, posts) {
        posts.forEach(function(post) {
            if (post.next_reminder > Date.now()) {
                module.exports.addJob(post);
            }
        });
    });
};