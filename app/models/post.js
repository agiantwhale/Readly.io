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

moment().format();

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
    schedulePost: function(delay, cb) {
        var model = this.model(this.constructor.modelName);
        model.findById(this._id)
        .select({
            'url': 1,
            'user': 1
        })
        .populate({
            // it seems i can't do this because of a 
            path: 'user',
            select: 'email verificationCode verified'
        })
        .exec(function(err, post) {
            if(!post.user.verified) {
                if(cb) cb();
                return;
            }

            console.log('Scheduling post: ' + post.id);

            var job = jobs.create('Post_Email', post._id).delay(delay).save();

            // add the completion handlerbug in Kue that generates a race condition
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
            post.save(function(err) {
                if(err) {
                    console.error('Error while scheduling post: ' + post.id);
                }

                if(cb) cb();
            });
        });
    },

    cancelPost: function(cb) {
        var post = this;
        jobs.get(post.jobId, function(err, job) {
            if (err) {
                if(cb) cb();
                return;
            }

            console.log('Canceling post: ' + post.id);

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
                if(post.next_reminder !== null && moment().isBefore(post.next_reminder)) {
                    console.log('Scheduling post: ' + post);
                    post.schedulePost(moment(post.next_reminder).diff(moment()));
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