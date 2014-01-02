'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    hat = require('hat'),
    mailer = require('../../config/mailer'),
    config = require('../../config/config'),
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
    var user = req.user;
    res.render('email/verify', {
        user: user ? JSON.stringify(user) : 'null'
    });
};

exports.sendVerifyMail = function(req, res) {
    console.log(req.body);

    var user = req.user;
    var email = sanitize(req.body.email).trim();
    var emailValid = check(email).isEmail();

    if (!emailValid) {
        return res.render('email/verify', {
            user: user ? JSON.stringify(user) : 'null',
            message: 'Invalid email.'
        });
    }

    if (user.verified && email === user.email) {
        //user is already verified with that address
        //no need to anything else
        return res.render('email/verify', {
            user: user ? JSON.stringify(user) : 'null',
            message: 'Already verified with that email address.'
        });
    } else {
        var verificationCode = hat();

        user.verified = false;
        user.email = email;
        user.verificationCode = verificationCode;

        var mailOptions = {
            to: email,
            subject: 'Readly verification email',
            html:
            '<img src="' + config.url + '/img/logo/dark.png' + '" alt="Readly.io" style="width: 100%"><p>'+
            '<br>Hello there!'+
            '<br>Please click on the following link to verify your email address.'+
            '<br><a href="' + config.url + '/verify/' + verificationCode + '">Verify me!</a>'+
            '<br>Thank you!'+
            '<br>- Readly Team</p>',

            text:
            'Readly.io'+
            '\nHello there!'+
            '\nPlease visit the link to verify your email address.'+
            '\n'+ config.url + '/verify/' + verificationCode +
            '\nThank you!'+
            '\n-Readly Team',
        };
        mailer(mailOptions);

        user.save(function(err) {
            if (err) {
                console.log(err);
                res.send(500, 'Internal server error');
            } else {
                user.closeStream();
                return res.render('email/sent', {
                    user: user ? JSON.stringify(user) : 'null'
                });
            }
        });
    }
};

exports.verify = function(req, res) {
    var verificationCode = req.params.verifyId;

    User.findOne({
        'verificationCode': verificationCode
    }).exec(function(err, user) {
        if (err) res.send(500, 'Internal server error');
        user.verified = true;
        user.verificationCode = hat();
        user.save(function(err) {
            if (err) {
                console.log(err);
                res.send(500, 'Internal server error');
            } else {
                user.openStream();
                res.render('email/success', {
                    user: user ? JSON.stringify(user) : 'null'
                });
            }
        });
    });
};

exports.unsubscribe = function(req, res) {
    var verificationCode = req.params.verifyId;

    User.findOne({
        'verificationCode': verificationCode
    }).exec(function(err, user) {
        if(err) res.send(500, 'Internal server error');
        user.verified = false;
        user.email = null;
        user.verificationCode = null;
        user.save(function(err) {
            if(err) {
                res.send(500, 'Internal server error');
            } else {
                user.closeStream();
                res.render('email/unsubscribe', {
                    user: user ? JSON.stringify(user) : 'null'
                });
            }
        });
    });
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