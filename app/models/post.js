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
    jobId: Number
});

PostSchema.methods = {
    schedulePost: function() {
        var post = this;

        // time to be delayed
        if(post.next_reminder > Date.now()) return;

        var delay = moment(post.next_reminder).subtract(Date.now()).valueOf();

        var job = jobs.create('emailPost', post);

        // add the completion handler
        job.on('complete', function() {
            post.prev_reminders.push(post.next_reminder);
            post.next_reminder = null;
            post.save();
        });

        // delay the job
        job.delay(delay);

        // save the job
        job.save();

        post.jobId = job.id;
        post.save();
    },

    cancelPost: function() {
        var post = this;
        jobs.get(post.jobId, function(err, job) {
            if (err) return; // job is already removed/doesn't exist
            job.remove();
        });
    }
};

PostSchema.post('save', function(post) {
    mongoose.model('Post').findOne(post).populate('user').exec(function(err, post){
        if(err) console.log(err);
        post.schedulePost();
    });
});

PostSchema.post('delete', function(post) {
    post.cancelPost();
});

PostSchema.statics.initJobs = function() {
    this.find().populate('user').exec(function(err, posts) {
        posts.forEach(function(post) {
            if (post.next_reminder > Date.now()) {
                //schedules.addJob(post);
                post.schedulePost();
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