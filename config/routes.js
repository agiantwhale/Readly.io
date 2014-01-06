'use strict';

module.exports = function(app, passport, auth) {
    //User Routes
    var users = require('../app/controllers/users');
    //app.get('/signin', users.signin);
    //app.get('/signup', users.signup);
    app.get('/retry', auth.requiresLogin, users.retry);
    app.get('/email', auth.requiresLogin, users.email);
    app.post('/email', auth.requiresLogin, users.sendVerifyMail);
    app.get('/verify/:verifyId', users.verify);
    app.get('/unsubscribe/:verifyId', users.unsubscribe);

    app.get('/signout', users.signout);

    //Setting the twitter oauth routes
    app.get('/auth/twitter', passport.authenticate('twitter', {
        failureRedirect: '/'
    }));

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        failureRedirect: '/'
    }), users.authCallback);

    // post routes
    var posts = require('../app/controllers/posts');
    app.get('/posts', auth.requiresLogin, posts.all); // list articles
    app.del('/posts/:postId', auth.requiresLogin, auth.post.hasAuthorization, posts.destroy); // delete it
    app.param('postId', posts.post);

    //Home route
    var index = require('../app/controllers/index');
    app.get('/', index.render);
};
