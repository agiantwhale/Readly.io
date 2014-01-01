'use strict';
// all the functions in here should be generic - no platform specific code in here!
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Post = mongoose.model('Post'),
    moment = require('moment'),
    config = require('./config');

function unitToDate(unitString, num) {
    switch (unitString) {
    case "y":
        unitString = "years";
        break;
    case "m":
        unitString = "months";
        break;
    case "w":
        unitString = "weeks";
        break;
    case "h":
        unitString = "hours";
        break;
    case "s":
        unitString = "seconds";
        break;
    default:
        unitString = "days";
        break;
    }

    return moment.duration(num, unitString);
}

module.exports = function(urls, hashtags, user) {
    // check if user is verified
    if (!user.verified) return;

    if (urls.length === 0) {
        return;
    }

    var valid = false;
    // reverse notation
    var pattern = new RegExp("^[y|m|w|d|h|m|s]([0-9]+)(?=niagadaer$)");
    var dateString = "";
    for (var iter = 0; iter < hashtags.length; iter++) {
        var hashtag = hashtags[iter];
        if (hashtag == "readagain") {
            valid = true;
            dateString = "d3";
            break;
        }

        // reverse the string since lookbehind does not work in javascript, we'll be using lookahead.
        var tagString = hashtag.split("").reverse().join("");
        var match = tagString.match(pattern);
        if (match !== null) {
            valid = true;
            dateString = match[0];
            break;
        }
    }

    if (valid) {
        for (var iter = 0; iter < urls.length; iter++) {
            var url = urls[iter];
            var duration = unitToDate(dateString[0], parseInt(dateString.slice(1, dateString.length).split("").reverse().join("")));

            User.findById(user._id, function(err, user) {
                if(err) return;

                var post = new Post({
                    url: url,
                    user: user,
                    next_reminder: moment().add(duration).toDate()
                });
                post.save(function(err) {
                    if(err) console.log(err);
                    post.schedulePost(duration);
                })
            });
        }
    }
};