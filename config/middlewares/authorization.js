'use strict';

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

exports.requiresVerification = function(req, res, next) {
    if(!req.user.verified) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

/**
 * User authorizations routing middleware
 */
exports.user = {
    hasAuthorization: function(req, res, next) {
        if (req.profile.id != req.user.id) {
            return res.send(401, 'User is not authorized');
        }
        next();
    }
};

exports.post = {
    hasAuthorization: function(req, res, next) {
        if(req.post.user.id != req.user.id) {
            return res.send(401, 'User is not authorized');
        }
        next();
    }
};