'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    schedules = require('../../config/schedules');


/**
 * Link Schema
 */
var PostSchema = new Schema({
    created: {
        type: Date,
    default:
        Date.now
    },
    url: {
        type: String,
    default:
        ''
    },
    next_reminder: {
        type: Date,
    default:
        Date.now
    },
    prev_reminders: [{
        type: Date,
    default:
        Date.now
    }],
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});


// function to validate URL, might want to add actual link checking (crawl link) later
function validateURL(textval) {
    var urlregex = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    return urlregex.test(textval);
}

PostSchema.post('save', function(post) {
    schedules.addJob(post);
});

/**
 * Validations
 */
PostSchema.path('url').validate(function(url) {
    return validateURL(url);
}, 'URL is not valid');

mongoose.model('Post', PostSchema);