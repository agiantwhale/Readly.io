'use strict';

module.exports = {
    url:"http://readly.io",
    db: process.env.MONGOHQ_URL,
    app: {
        name: "Readly"
    },
    embedlyKey: process.env.EMBEDLY_KEY,
    redis: process.env.REDISTOGO_URL,
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
        clientID: "yCse4wan08ilgIaVOarrA",
        clientSecret: "NR5OJsrXoRGNI6uq6B1k9Owkmd9LoRmVj5uTps28obQ",
        callbackURL: "http://readly.io/auth/twitter/callback"
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