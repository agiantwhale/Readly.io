'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    url = require('url'),
    kue = require('kue'),
    redis = require('redis'),
    fs = require('fs'),
    passport = require('passport'),
    moment = require('moment'),
    async = require('async'),
    logger = require('mean-logger');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

//Load configurations
//Set the node enviornment variable if not set before
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

//Initializing system variables 
var config = require('./config/config'),
    auth = require('./config/middlewares/authorization'),
    mongoose = require('mongoose');

// kue settings
if (config.redis) {
    kue.redis.createClient = function() {
        var rtg = url.parse(config.redis);
        var client = redis.createClient(rtg.port, rtg.hostname);
        client.auth(rtg.auth.split(':')[1]);
        return client;
    };
}

//Bootstrap db connection
var db = mongoose.connect(config.db);

//Bootstrap models
var models_path = __dirname + '/app/models';
var walk = function(path) {
        fs.readdirSync(path).forEach(function(file) {
            var newPath = path + '/' + file;
            var stat = fs.statSync(newPath);
            if (stat.isFile()) {
                if (/(.*)\.(js$|coffee$)/.test(file)) {
                    require(newPath);
                }
            } else if (stat.isDirectory()) {
                walk(newPath);
            }
        });
    };
walk(models_path);

var User = mongoose.model('User');
User.initStreams();

var Post = mongoose.model('Post');
post.initJobs();

/*
async.series([

function(callback) {
    //Initialize streams...
    console.log('Initializing streams...');
    var User = mongoose.model('User');
    User.find({}, function(err, users) {
        var processArray = [];
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            processArray.push(function(cb) {
                user.openStream(cb);
            });
        }

        async.parallel(processArray, function(err, results) {
            console.log('Finished initializing streams!');
            callback();
        });
    });
}, function(callback) {
    //Initialize jobs...
    console.log('Initializing jobs...');
    var Post = mongoose.model('Post');
    Post.find({}).populate('user').exec(function(err, posts) {
        var processArray = []
        for (var i = 0; i < posts.length; i++) {
            var post = posts[i];

            if (post.next_reminder !== null && moment().isBefore(post.next_reminder)) {
                console.log('Scheduling post: ' + post);
                processArray.push(function(cb) {
                    post.schedulePost(moment(post.next_reminder).diff(moment()), cb);
                });
            }
        };

        async.parallel(processArray, function(err, results) {
            console.log('Finished scheduling posts!');
            callback();
        });
    });
}], function(err, results) {
    if (err) console.log('Error: ' + err);
    console.log('Complete!');
    //process.exit();
});
*/