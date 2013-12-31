// worker process, handles twitter stream
'use strict';

var url = require('url'),
    kue = require('kue'),
    redis = require('redis'),
    twitter = require('twitter'),
    mongoose = require('mongoose'),
    config = require('./config/config'),
    process = require('./config/process'),
    mailer = require('./config/mailer');

console.log('Initializing worker...');

// connect with the DB
mongoose.connect(config.db);

// kue settings
if (config.redis) {
    kue.redis.createClient = function() {
        var rtg = url.parse(config.redis);
        var redis = redis.createClient(rtg.port, rtg.hostname);
        redis.auth(rtg.auth.split(":")[1]);
        return redis;
    };
}

var jobs = kue.createQueue();

jobs.process('twitterStream', function(job, done) {
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

                console.log(hashtags);

                process(urls, hashtags, user);
            }
        });

        streamsDict[user.id] = stream;
    });
});

jobs.process('emailPost', function(job, done) {
    var post = job.data;
    var mailOptions = {
        to: post.user.email,
        subject: "ReadAgain Reminder",
        text: post.url
    };
    mailer(mailOptions);
    done();
});