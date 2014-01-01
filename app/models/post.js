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
    //delay is a moment function
    schedulePost: function(delay) {
        var model = this.model(this.constructor.modelName);
        model.findById(this._id)
        .select('user url')
        .populate('user')
        .exec(function(err, post) {
            if (!delay) delay = moment(post.next_reminder).subtract(moment());

            var job = jobs.create('emailPost', post);

            // add the completion handler
            job.on('complete', function() {
                post.prev_reminders.push(post.next_reminder);
                post.next_reminder = null;
                post.jobId = null;
                post.save();
            });

            // delay the job
            job.delay(delay.valueOf());

            // save the job
            job.save();

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

PostSchema.statics.initJobs = function() {
    this.find().populate('user').exec(function(err, posts) {
        posts.forEach(function(post) {
            if(moment().isBefore(post.next_reminder)) post.schedulePost();
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