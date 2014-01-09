'use strict';

module.exports = {
    url:"http://localhost:3000",
    db: "mongodb://localhost/mean-dev",
    app: {
        name: "Readly"
    },
    mail: {
        service: "Gmail",
        auth: {
            user: "GMAIL_ACCOUNT",
            pass: "GMAIL_PASSWORD"
        }
    },
    facebook: {
        clientID: "APP_ID",
        clientSecret: "APP_SECRET",
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    twitter: {
        clientID: "APP_ID",
        clientSecret: "APP_SECRET",
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