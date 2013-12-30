'use strict';

module.exports = {
    url:"http://readagain-dev.herokuapp.com",
    db: process.env.MONGOHQ_URL,
    app: {
        name: "ReadAgain"
    },
    mail: {
        service: "SendGrid",
        auth: {
            user: process.env.SENDGRID_USERNAME,
            pass: process.env.SENDGRID_PASSWORD
        }
    },
    facebook: {
        clientID: "APP_ID",
        clientSecret: "APP_SECRET",
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    twitter: {
        clientID: "5pPUdA7wN4fOjgpQyntw",
        clientSecret: "rPrvoNVDj8CbwhTHqfZ94BnoFkwzRraxGyPWPxasE0",
        callbackURL: "http://readagain-dev.herokuapp.com/auth/twitter/callback"
    },
    github: {
        clientID: "APP_ID",
        clientSecret: "APP_SECRET",
        callbackURL: "http://localhost:3000/auth/github/callback"
    },
    google: {
        clientID: "APP_ID",
        clientSecret: "APP_SECRET",
        callbackURL: "http://localhost:3000/auth/google/callback"
    }
}