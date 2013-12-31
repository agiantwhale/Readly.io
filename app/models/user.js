'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    kue = require('kue'),
    check = require('validator').check,
    Schema = mongoose.Schema,
    jobs = kue.createQueue();


/**
 * User Schema
 */
var UserSchema = new Schema({
    verified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        unique: true
    },
    email: String,
    //facebook: {},
    twitter: {
        /*
        token: {
            type: String,
            default: ''
        },
        tokenSecret: {
            type: String,
            default: ''
        },
        */
        profile: {},
        streamId: Number
    },
    //github: {},
    //google: {}
});

UserSchema.methods = {
    openStream: function() {
        var user = this;

        // user isn't verified
        if(!user.verified) return;

        var job = jobs.create('twitterStream', user).save();
        user.twitter.streamId = job.id;
        user.save(function(err) {
            if (err) console.log(err);
        });
    },

    closeStream: function() {
        var user = this;
        kue.Job.get(user.twitter.streamId, function(err, job) {
            if (err) return;
            job.remove();
        });
    }
};

UserSchema.statics.initStreams = function() {
    this.find({}, function(err, users) {
        // users.forEach(twitter_stream.openStream);
        users.forEach(function(user) {
            user.openStream();
        });
    });
};

UserSchema.path('email').validate(function(email) {
    return check(email).isEmail();
}, 'Email cannot be blank');

mongoose.model('User', UserSchema);