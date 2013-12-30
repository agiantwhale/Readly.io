'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    schedules = require('../../config/schedules'),
    check = require('validator').check,
    sanitize = require('validator').sanitize;


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

PostSchema.post('save', function(post) {
    mongoose.model('Post').findOne(post).populate('user').exec(function(err, post){
        if(err) console.log(err);
        schedules.addJob(post);
    });
});

PostSchema.post('delete', function(post) {
    schedules.removeJob(post);
});

PostSchema.statics.initJobs = function() {
    this.find().populate('user').exec(function(err, posts) {
        posts.forEach(function(post) {
            if (post.next_reminder > Date.now()) {
                schedules.addJob(post);
            }
        });
    });
};

/**
 * Validations
 */
PostSchema.path('url').validate(function(url) {
    return check(url).isUrl();
}, 'URL is not valid');

mongoose.model('Post', PostSchema);