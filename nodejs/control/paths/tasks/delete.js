const express = require('express');
const route = express.Router();
const TaskSQL = require("../../../model/sql/task");
const Login =   require("../../../model/login");

route.use("/delete/:id", (req, res)=>{
    TaskSQL.checkOwner(Login(req).getLogin(), Number(req.params.id)).then((isowner)=>{
        if(!isowner){
            res.render("message", {message: "Fordibben"});
            return;
        }

        TaskSQL.delete(Number(req.params.id), ()=>res.render("message", {message: "OK"}), (err)=>res.render("message", {message: err.message}));
    }).catch(err=>res.render("message", {message: err.message}));
});

module.exports = route;