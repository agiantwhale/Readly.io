'use strict';

var config = require('./config'),
    twitter = require('twitter'),
    process = require('./post');

module.exports.openStream = function(user) {
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
                for(var iter = 0; iter < data.entities.urls.length; iter++) {
                    urls.push(data.entities.urls[iter].expanded_url);
                }

                var hashtags = [];
                for(var iter = 0; iter < data.entities.hashtags.length; iter++) {
                    hashtags.push(data.entities.hashtags[iter].text);
                }

                console.log(hashtags);

                process(urls, hashtags, user);
            }
        });
    });
};