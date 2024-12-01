const express = require('express');
const route = express.Router();
const TaskSQL = require("../../../model/sql/task");
const UserSQL = require("../../../model/sql/user");
const Login =   require("../../../model/login");
const urlencodedParser = express.urlencoded({extended: false});

route.get("/delegate/:id", async (req, res)=>{
    TaskSQL.checkOwner(Number(Login(req).getLogin()), Number(req.params.id)).then(isAllowed=>{
        if(!isAllowed){
            res.render("message", {message: "Forbidden"});
            return;
        }
        res.render("user_select", {id: Number(req.params.id)});
    }, err=>res.render("message", {message: err.message}));
});

route.post("/delegate/:id", urlencodedParser, async(req, res)=>{
    if(! await TaskSQL.checkOwner(Number(Login(req).getLogin()), Number(req.params.id))){
        res.render("message", {"message": "forbidden"});
        return;
    }

    console.log("Body is ", req.body);

    UserSQL.read_where({login: req.body.login}, user=>{
        if(user.length != 1){
            res.render("message", {message: "no such login"});
            return;
        } else user = user[0];

        TaskSQL.update(Number(req.params.id), {ownerid: Number(user.id)}).then(
            ()=>res.redirect("/tasks/task/" + req.params.id),
            err=>res.render("message", {message: err.message})     
        );
    }, err=>res.render("message", {message: err.message}));

});

route.get("/get/:like", (req, res)=>{
    UserSQL.likeLoginOrName(req.params.like).then(_=>res.send(_), _=>res.render("message", {message: _.message}));
});

route.get("/get", (req, res)=>{
    UserSQL.likeLoginOrName("%").then(_=>res.send(_), _=>res.render("message", {message: _.message}));
});


module.exports = route;