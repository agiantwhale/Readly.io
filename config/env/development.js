'use strict';

module.exports = {
    url:"http://localhost:3000",
    db: "mongodb://localhost/mean-dev",
    app: {
        name: "ReadAgain"
    },
    mail: {
        service: "Gmail",
        auth: {
            user: "mgibson095@gmail.com",
            pass: "Of6v71X1R#&fHkW8MXJ.Z{i024pcO274Je7Z3pD}3E3NP$BlII"
        }
    },
    facebook: {
        clientID: "APP_ID",
        clientSecret: "APP_SECRET",
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    twitter: {
        clientID: "6edUCj3udKXFHjWT4VP0hQ",
        clientSecret: "2Y7ZCCkrJeRyzBJUkn5VGqpORivnzzroqZucczIE4k",
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