'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    twitter_stream = require('../../config/twitter_stream'),
    mailer = require('../../config/mailer'),
    config = require('../../config/config'),
    jwt = require('jwt-simple'),
    check = require('validator').check,
    sanitize = require('validator').sanitize;

/**
 * Auth callback
 * User has finished logging in/signing up
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};

/**
 * Show email form
 */
exports.email = function(req, res) {
    res.render('email/verify', {
        title: 'Verify',
        message: req.flash('error')
    });
};

exports.sendVerifyMail = function(req, res) {
    var user = req.user;
    var email = sanitize(req.body.email).trim();
    var emailValid = check(email).isEmail();

    if(!emailValid) {
        return res.send(400, 'Invalid email');
    }

    if(user.verified && email == user.email) {
        //user is already verified with that address
        //no need to anything else
        res.jsonp({
            status: 'verified'
        });
    } else {
        user.verified = false;
        user.email = email;

        var payload = {
            user: user,
            email: email
        };
        var encoded = jwt.encode(payload, config.passkey);

        var mailOptions = {
            to: email,
            subject: "Verify your email!", // Subject line
            text: config.url + '/verify/' + encoded, // plaintext body
        };
        mailer(mailOptions);

        user.save(function(err) {
            if(err) {
                console.log(err);
                res.send(500, 'Internal server error');
            } else {
                twitter_stream.closeStream(user);
                res.jsonp({status: 'success'});
            }
        });
    }
};

exports.verify = function(req, res) {
    var user = req.user;
    var payload = req.params.verifyId;
    var decoded = jwt.decode(payload, config.passkey);
    
    if(decoded.user == user && decoded.email == user.email) {
        user.verified = true;
        user.save(function(err) {
            if(err) {
                console.log(err);
                res.send(500, 'Internal server error');
            } else {
                twitter_stream.openStream(user);
                res.jsonp({status: 'success'});
            }
        }); 
    } else {
        res.send(401, 'User is not authorized');
    }
};

/**
 * Show sign up form
 */
exports.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    });
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
    res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res, next) {
    var user = new User(req.body);
    var message = null;

    user.provider = 'local';
    user.save(function(err) {
        if (err) {
            switch (err.code) {
            case 11000:
            case 11001:
                message = 'Username already exists';
                break;
            default:
                message = 'Please fill all the required fields';
            }

            return res.render('users/signup', {
                message: message,
                user: user
            });
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    });
};

/**
 * Send User
 */
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User.findOne({
        _id: id
    }).exec(function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));
        req.profile = user;
        next();
    });
};