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

async.series([
function(callback) {
    //Initialize streams...
    console.log('Initializing streams...');
    var User = mongoose.model('User');
    User.find({}, function(err, users) {
        for(var i = 0; i < users.length; i++) {
            users[i].openStream();
        }

        callback();
    });
},
function(callback) {
    //Initialize jobs...
    console.log('Initializing jobs...');
    var Post = mongoose.model('Post');
    Post.find({}, function(err, posts) {
        for(var i = 0; i < posts.length; i++) {
            posts[i].schedulePost();
        };

        callback();
    });
}],
function(err, results) {
    if(err) console.log('Error: ' + err);
    console.log('Complete!');
    process.exit();
});