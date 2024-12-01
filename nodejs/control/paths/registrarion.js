const express = require('express');
const router = express.Router();
const Login = require('../../model/login');

const urlencodedParser = express.urlencoded({extended: false});
let = __exception_routes__ = [];


// Redirecting anauthorized if not allowed
router.use("/", (req, res, next)=>{
    console.log(req.path, req.method);
    if(__exception_routes__.indexOf(req.path) >= 0)next();
    else if(Login(req).isLoged()) next();
    else if(req.originalUrl != "/login"){
        Login(req).setLastURL(req.path);
        console.log("redirecting to login");
        res.redirect("/login");
    }
});


// For login
router.get('/login', (req, res) => {
    if(req.params?.exit)Login(req).exit();

    res.render("./login.hbs", {login: true, register: false});
});

// For hadling login
router.post('/login', urlencodedParser, (req, res)=>{
    Login(req).enter(req.body.login, req.body.password).then(result=>{
        res.redirect(303, Login(req).getLastURL() || "/tasks/my");
    }, err=>res.send(err.message));
});


// For registration
router.get('/register', (req, res) => {
    res.render("./login.hbs", {login: false, register: true});
});

// For hadling register
router.post('/register', urlencodedParser, (req, res) => {
    Login(req).register(req.body.name, req.body.login, req.body.password).then(result=>{
        res.redirect(303, "/tasks/my");
    }, err=>res.send(err.message));
});

module.exports = function(exceptions_routes = []){
    __exception_routes__ = exceptions_routes;
    return router;
};
