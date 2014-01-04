'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema,
    kue = require('kue'),
    check = require('validator').check,
    jobs = kue.createQueue();


/**
 * Link Schema
 */
var PostSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    url: {
        type: String,
        default: ''
    },
    next_reminder: {
        type: Date,
        default: Date.now
    },
    prev_reminders: [{
        type: Date,
        default: Date.now
    }],
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    jobId: {
        type: Number,
        select: false
    }
});

PostSchema.methods = {
    //delay is a moment function
    schedulePost: function(delay) {
        var model = this.model(this.constructor.modelName);
        model.findById(this._id)
        .select({
            'url': 1,
            'user': 1
        })
        .populate({
            path: 'user',
            select: 'email verificationCode verified'
        })
        .exec(function(err, post) {
            if(!post.user.verified) return;

            var delayMs = 0;
            if(delay !== undefined && delay) {
                delayMs = delay.valueOf();
            } else if (!delay && moment().isBefore(post.next_reminder)) {
                delayMs = moment(post.next_reminder).subtract(moment()).valueOf();
            }

            var job = jobs.create('emailPost', post).delay(delayMs).save();

            // add the completion handler
            // it seems i can't do this because of a bug in Kue that generates a race condition
            // see https://github.com/LearnBoost/kue/issues/183
            /*
            job.on('complete', function() {
                console.log('Email sent!');
                post.prev_reminders.push(post.next_reminder);
                post.next_reminder = null;
                post.jobId = null;
                post.save();
            });
            */

            post.jobId = job.id;
            post.save();
        });
    },

    cancelPost: function() {
        var post = this;
        jobs.get(post.jobId, function(err, job) {
            if (err) return; // job is already removed/doesn't exist
            job.remove();
        });
    }
};

// save scheduling/canceling in save post callback will cause an infinite loop
/*
PostSchema.post('save', function(post) {
    mongoose.model('Post').findOne(post).populate('user').exec(function(err, post){
        if(err) console.log(err);
    });
});
*/

PostSchema.post('delete', function(post) {
    post.cancelPost();
});

PostSchema.statics = {
    initJobs: function() {
        this.find().populate('user').exec(function(err, posts) {
            posts.forEach(function(post) {
                if(post.next_reminder && moment().isBefore(post.next_reminder)) {
                    console.log('Scheduling post: ' + post);
                    post.schedulePost();
                }
            });
        });
    },

    load: function(id, cb) {
        this.findOne({
            _id: id
        })
        .populate('user')
        .exec(cb);
    }
};

/**
 * Validations
 */
PostSchema.path('url').validate(function(url) {
    return check(url).isUrl();
}, 'URL is not valid');

mongoose.model('Post', PostSchema);