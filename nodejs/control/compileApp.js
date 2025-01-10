const Cypher = require("./cypher");
const session = require('express-session');
const register = require('./paths/registrarion');
const hbs = require("hbs");
const tasks = require("./paths/tasks");
const comments = require("./paths/comments");
const alerts = require("./paths/alerts");
const express = require("express");
const Login = require("../model/login");
require("../views/helpers/pretty_date"); // compile helper


class CompileApp {
    hbs(app) {
        app.set('view engine', 'hbs');
        app.set("views", "views/hbs");
        hbs.registerPartials("views/partials");
    }

    async session(app) {
        app.use(session({
            secret: await Cypher.hash("somekey?_1"),
            resave: false,
            saveUninitialized: true,
            cookie: { secure: false }
        }));
    }

    registration(app) {
        app.use("/", register(["/login", "/register", "/favicon.ico"]));
    }

    tasks(app) {
        app.use("/tasks", tasks);
    }

    alerts(app) {
        app.use("/alerts", alerts);
    }

    comments(app) {
        app.use("/comments", comments);
    }

    async compile(app) {
        this.hbs(app);
        await this.session(app);
        this.registration(app);
        this.tasks(app);
        this.comments(app);
        this.alerts(app);

        app.get("/", (req, res) => res.redirect("/tasks/my"));
    }
}


module.exports = new CompileApp();
