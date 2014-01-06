'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    kue = require('kue'),
    Schema = mongoose.Schema,
    jobs = kue.createQueue();


/**
 * User Schema
 */
var UserSchema = new Schema({
    verified: {
        type: Boolean,
        default:false
    },
    verificationCode: {
        type: String,
        unique: true,
        select: false
    },
    email: String,
    //facebook: {},
    twitter: {
        token: {
            type: String,
            default: '',
            select: false
        },
        tokenSecret: {
            type: String,
            default: '',
            select: false
        },
        profile: {},
        streamId: {
            type: Number,
            select: false
        }
    },
    //github: {},
    //google: {}
});

UserSchema.methods = {
    openStream: function(cb) {
        var user = this;
        var model = user.model(user.constructor.modelName);
        model
        .findById(user._id)
        .exec(function(err, user) {
            // user isn't verified
            if (!user.verified) {
                console.log(user.twitter_name + ' is an unverified user! Skipping stream...');
                if(cb) cb();
                return;
            }

            console.log('Opening Twitter stream for ' + user.twitter_name);

            var job = jobs.create('User_TwitterStream', user._id).save();
            user.twitter.streamId = job.id;
            user.save(function(err) {
                if (err) {
                    console.error('Error occured! Error: ' + err + ', user:' + user.twitter_name);
                } else {
                    console.log('Stream open request sent successfully.');
                }

                if(cb) cb();
            });
        });
    },

    closeStream: function(cb) {
        var user = this;
        kue.Job.get(user.twitter.streamId, function(err, job) {
            if (err) {
                if(cb) cb();
                return;
            }

            console.log('Closing Twitter stream for ' + user.twitter_name);

            job.remove();

            if(cb) cb();
        });
    }
};

UserSchema.virtual('twitter_name').get(function() {
    return '@'+this.twitter.profile.screen_name;
});

UserSchema.statics.initStreams = function() {
    this.find({}, function(err, users) {
        // users.forEach(twitter_stream.openStream);
        users.forEach(function(user) {
            user.openStream();
        });
    });
};

mongoose.model('User', UserSchema);