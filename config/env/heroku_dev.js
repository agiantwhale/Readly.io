'use strict';

module.exports = {
    db: "mongodb://heroku:c8f98115338676cc25c8613d03bb0919@paulo.mongohq.com:10078/app20751307",
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
        callbackURL: "http://readagain.herokuapp.com//auth/twitter/callback"
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