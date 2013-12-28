'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    authTypes = ['github', 'twitter', 'facebook', 'google'],
    twitter_stream = require('../../config/twitter_stream');


/**
 * User Schema
 */
var UserSchema = new Schema({
    email: String,
    provider: String,
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
    User.find({}, function(err, users) {
        users.forEach(twitter_stream.openStream);
    });
};

UserSchema.post('save', function(user) {
    twitter_stream.openStream(user);
});

UserSchema.path('email').validate(function(email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
}, 'Email cannot be blank');

mongoose.model('User', UserSchema);