'use strict';

var mongoose = require('mongoose'),
    Post = mongoose.model('Post');

/**
 * Find post by id
 */
exports.post = function(req, res, next, id) {
    Post.load(id, function(err, post) {
        if (err) return next(err);
        if (!post) return next(new Error('Failed to load post ' + id));
        req.post = post;
        next();
    });
};

/**
 * Delete an post
 */
exports.destroy = function(req, res) {
    var post = req.post;

    post.remove(function(err) {
        if (err) {
            return res.send(500, 'Internal server error');
        } else {
            res.jsonp(post);
        }
    });
};

/**
 * List of Posts
 */
exports.all = function(req, res) {
    Post
    .find({
        user: req.user
    })
    .sort('-created')
    .populate('user')
    .exec(function(err, posts) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(posts);
        }
    });
};