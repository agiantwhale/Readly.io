'use strict';

module.exports = {
    db: "mongodb://localhost/mean-dev",
    app: {
        name: "ReadAgain"
    },
    facebook: {
        clientID: "APP_ID",
        clientSecret: "APP_SECRET",
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    twitter: {
        clientID: "5pPUdA7wN4fOjgpQyntw",
        clientSecret: "rPrvoNVDj8CbwhTHqfZ94BnoFkwzRraxGyPWPxasE0",
        callbackURL: "http://localhost:3000/auth/twitter/callback"
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