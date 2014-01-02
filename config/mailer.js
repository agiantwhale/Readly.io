var nodemailer = require("nodemailer"),
    config = require('./config');

var smtpTransport = nodemailer.createTransport("SMTP", config.mail);

module.exports = function(mailOptions) {
    mailOptions.from = "noreply@readly.io";
    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }
    });
};