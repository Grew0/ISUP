const express = require('express');
const route = express.Router();
const TaskSQL = require("../../../model/sql/task");
const Login =   require("../../../model/login");
const { DATEFORMAT } = require('../../../views/helpers/pretty_date');
const urlencodedParser = express.urlencoded({extended: false});


// To create task
route.get("/create", (req, res)=>{
    res.render("create_task", { parent: (req.query?.parent || "no_parent") });
});

route.post("/create", urlencodedParser, async (req, res)=>{
    let {name, desc, deadline, priority, parent} = req.body;
    if(parent == "no_parent")parent = null;
    else parent = Number(parent);

    if(parent && await TaskSQL.checkOwner(Number(Login(req).getLogin()), parent) != 1){
        res.render('message', {message: 'forbidden', redirect: "/tasks/task/" + parent});
        return;
    }
    TaskSQL.create(name, desc, new Date(deadline), Number(priority), Login(req).getLogin(), parent);
    res.render('message', {message: 'ok'});
});




module.exports = route;