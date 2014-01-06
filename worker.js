// worker process, handles twitter stream
'use strict';

var fs = require('fs'),
    url = require('url'),
    kue = require('kue'),
    redis = require('redis'),
    embedly = require('embedly'),
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

jobs.on('job complete', function(id) {
    kue.Job.get(id, function(err, job) {
        if (err) return;
        job.remove(function(err) {
            if (err) {
                console.err('Error removing job ' + job.id + '!');
            }
        });
    });
});

jobs.process('User_TwitterStream', 100, function(job, done) {
    var User = mongoose.model('User');

    User.findById(job.data).select('verified twitter.profile twitter.token twitter.tokenSecret').exec(function(err, user) {
        if (err) {
            console.err('Invalid id sent to User_TwitterStream.');
            done();
            return;
        }

        console.log('Stream started on worker process for ' + user.twitter_name); //prototype functions are lost in data translation
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
            track: 'readly'
        }, function(stream) {
            stream.on('data', function(data) {
                if (!user.verified) return;

                if (data.entities && data.user) {
                    // avoid dupes when opening multiple streams
                    if (data.user.id !== user.twitter.profile.id) {
                        return;
                    }

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
});

jobs.process('Post_Email', 100, function(job, done) {
    var Post = mongoose.model('Post');

    Post.findById(job.data).select('url user prev_reminders next_reminder jobId').populate({
        path: 'user',
        select: 'email twitter.profile verificationCode'
    }).exec(function(err, post) {
        var user = post.user;

        console.log('Post (' + post.id + ') sending to ' + user.twitter_name);

        new embedly({
            key: config.embedlyKey
        }, function(err, api) {
            if (err) {
                console.error('Error creating Embedly api');
                done();
                return;
            }

            api.extract({
                url: post.url,
                maxwidth: 500
            }, function(err, results) {
                if (err) {
                    console.log('Embedly request failed.');
                    done();
                    return;
                }

                var result = results[0];
                var description = result.description;
                var title = result.title;

                var mailOptions = {
                    to: user.email,
                    subject: 'Readly: ' + title,
                    html: '<img src="' + config.url + '/img/logo/dark.png' + '" alt="Readly.io" style="width: 100%"><p>' + '<br>Title: ' + title + '<br>Description: ' + description + '<br><a href="' + post.url + '">Visit link</a>' + '<br>' + '<br>' + '<br>' + '<br><a href="' + config.url + '/unsubscribe/' + user.verificationCode + '">Unsubscribe</a> from Readly' + '<br>- Readly Team</p>',
                    text: 'Readly.io' + '\nTitle:' + title + '\nDescription: ' + description + '\nLink: ' + post.url + '\n' + '\n' + '\n' + '\nUnsubscribe from Readly: ' + config.url + '/unsubscribe/' + user.verificationCode + '\n- Readly Team'
                };
                mailer(mailOptions);

                // this is a hack, but due to the race condition preventing complete handler
                // look at /model/post.js
                post.prev_reminders.push(post.next_reminder);
                post.next_reminder = null;
                post.jobId = null;
                post.save();
            })
        });

        done();
    });
});