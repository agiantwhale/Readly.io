'use strict';
// all the functions in here should be generic - no platform specific code in here!
var mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    config = require('./config');

function unitToMilliseconds(unitString) {
    switch (unitString) {
    case "y":
        return 365 * 24 * 60 * 60 * 1000; //not exactly but who cares
    case "m":
        return 31 * 24 * 60 * 60 * 1000; //not exactly but who cares
    case "w":
        return 7 * 24 * 60 * 60 * 1000;
    case "d":
        return 24 * 60 * 60 * 1000;
    case "h":
        return 60 * 60 * 1000;
    case "m":
        return 60 * 1000;
    case "s":
        return 1000;
    default:
        return 0;
    }
}

module.exports = function(urls, hashtags, user) {
    if (urls.length == 0) {
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
            var post = new Post({
                url: url,
                user: user,
                next_reminder: new Date(unitToMilliseconds(dateString[0]) * parseInt(dateString.slice(1, dateString.length).split("").reverse().join("")))
            });
        }
    }
};