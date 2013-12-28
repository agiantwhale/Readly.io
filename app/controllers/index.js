'use strict';

exports.render = function(req, res) {
    console.log('Hello World!');

    res.render('index', {
        user: req.user ? JSON.stringify(req.user) : 'null'
    });

    console.log('Fin hello world!');
};
