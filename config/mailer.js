var nodemailer = require("nodemailer"),
    _ = require('lodash'),
    config = require('./config');

var smtpTransport = nodemailer.createTransport("SMTP", config.mail);

/*
var mailOptions = {
    from: "Fred Foo ✔ <foo@blurdybloop.com>",
    // sender address
    to: "bar@blurdybloop.com, baz@blurdybloop.com",
    // list of receivers
    subject: "Hello ✔",
    // Subject line
    text: "Hello world ✔",
    // plaintext body
    html: "<b>Hello world ✔</b>" // html body
}
*/

module.exports = function(mailOptions) {
    mailOptions.from = "noreply@readagain.io";
    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }
    });
};