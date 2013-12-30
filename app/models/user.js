'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    authTypes = ['github', 'twitter', 'facebook', 'google'],
    check = require('validator').check,
    sanitize = require('validator').sanitize;


/**
 * User Schema
 */
var UserSchema = new Schema({
    verified: {
        type: Boolean,
        default: false
    },
    email: String,
    //facebook: {},
    twitter: {
        token: {
            type: String,
            default: ""
        },
        tokenSecret: {
            type: String,
            default: ""
        },
        profile: {}
    },
    //github: {},
    //google: {}
});

UserSchema.statics.initStreams = function() {
    this.find({}, function(err, users) {
        users.forEach(twitter_stream.openStream);
    });
};

UserSchema.path('email').validate(function(email) {
    return check(email).isEmail();
}, 'Email cannot be blank');

mongoose.model('User', UserSchema);