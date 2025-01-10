const express = require('express');
const router = express.Router();
const Login = require('../../model/login');

const urlencodedParser = express.urlencoded({ extended: false });
let = __exception_routes__ = [];


// Redirecting anauthorized if not allowed
router.use("/", (req, res, next) => {
    console.log(req.path, req.method);
    if (__exception_routes__.indexOf(req.path) >= 0) next();
    else if (Login(req).isLoged()) next();
    else if (req.originalUrl != "/login" && req.originalUrl.split("/")[1] != "api") {
        // TODO delete or comment it out
        // This code will automatically registet user as Grew 
        /*/ 
        Login(req).enter("Grew", "pass").then(()=>next(), err=>res.send(err.message));
        return;
        /**/
        //

        Login(req).setLastURL(req.path);
        console.log("redirecting to login");
        res.redirect("/login");
    }else next();
});


// For login
router.get('/login', (req, res) => {
    if (req.params?.exit) Login(req).exit();

    res.render("./login.hbs", { login: true, register: false });
});

// For hadling login
router.post('/login', urlencodedParser, (req, res) => {
    if (req.body.password.length >= 40) {
        res.render("message", { "message": "Пароль должен быть меньше 40 символов длиной" });
    } else {
        Login(req).enter(req.body.login, req.body.password).then(result => {
            res.redirect(303, Login(req).getLastURL() || "/tasks/my");
        }, err => res.send(err.message));
    }
});


// For registration
router.get('/register', (req, res) => {
    res.render("./login.hbs", { login: false, register: true });
});

// For hadling register
router.post('/register', urlencodedParser, (req, res) => {
    Login(req).register(req.body.name, req.body.login, req.body.password).then(result => {
        res.redirect(303, "/tasks/my");
    }, err => {
        if(err.message.includes("Duplicate"))
            res.render("message", {"message": "Извините, но этот логин уже занят"});
        else res.send(err.message)
    });
});

module.exports = function (exceptions_routes = []) {
    __exception_routes__ = exceptions_routes;
    return router;
};
