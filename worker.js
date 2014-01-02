// worker process, handles twitter stream
'use strict';

var fs = require('fs'),
    url = require('url'),
    kue = require('kue'),
    redis = require('redis'),
    twitter = require('twitter'),
    mongoose = require('mongoose');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

console.log('Initializing worker...');

var config = require('./config/config'),
    mailer = require('./config/mailer');

// kue settings
if (config.redis) {
    kue.redis.createClient = function() {
        var rtg = url.parse(config.redis);
        var client = redis.createClient(rtg.port, rtg.hostname);
        client.auth(rtg.auth.split(':')[1]);
        return client;
    };
}

// connect with the DB
mongoose.connect(config.db);

// Bootstrap models
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

var jobs = kue.createQueue(),
    processPost = require('./config/process');

jobs.promote();

jobs.on('job complete', function(id){
    kue.Job.get(id, function(err, job){
        if (err) return;
        job.remove(function(err){
            if (err) return;
        });
    });
});

jobs.process('twitterStream', 100, function(job, done) {
    console.log('Stream opened!');
    // Don't close this job, we need to close it when user changes email address

    var user = job.data;
    /*
     *  User
     *      -token
     *      -tokenSecret
     *      -profile
     */
    var twit = new twitter({
        consumer_key: config.twitter.clientID,
        consumer_secret: config.twitter.clientSecret,
        access_token_key: user.twitter.token,
        access_token_secret: user.twitter.tokenSecret
    });

    twit.stream('statuses/filter', {
        follow: user.twitter.profile.id_str,
        track: "readagain"
    }, function(stream) {
        stream.on('data', function(data) {
            if (data.entities) {
                var urls = [];
                for (var iter = 0; iter < data.entities.urls.length; iter++) {
                    urls.push(data.entities.urls[iter].expanded_url);
                }

                var hashtags = [];
                for (var iter = 0; iter < data.entities.hashtags.length; iter++) {
                    hashtags.push(data.entities.hashtags[iter].text);
                }

                processPost(urls, hashtags, user);
            }
        });
    });

    done();
});

jobs.process('emailPost', 100, function(job, done) {
    var post = job.data;
    var mailOptions = {
        to: post.user.email,
        subject: "Readly article reminder",
        text: post.url
    };
    mailer(mailOptions);

    // this is a hack, but due to the race condition preventing complete handler
    // look at /model/post.js
    mongoose.model('Post')
    .findById(post._id)
    .select('prev_reminders next_reminder jobId')
    .exec(function(err, post) {
        post.prev_reminders.push(post.next_reminder);
        post.next_reminder = null;
        post.jobId = null;
        post.save();
    });

    done();
});