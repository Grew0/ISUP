const express = require('express');
const route = express.Router();
const Login = require('../../../model/login');
const subs = require('../../../model/sql/subs');


route.patch("/sub/:task/:result", (req, res)=>{
    let {task, result} = req.params;
    task = Number(task);
    result = (result == 'true');
    let promm;
    if(result){
        promm = Login(req).subscribe(task);
    }else promm = Login(req).unsubscribe(task);
    promm.then(()=>{res.send("OK")}).catch(err=>res.send("Error: " + err.message));
    
});

route.get("/sub/watched/:task/", (req, res)=>{
    subs.isawared(req.params.task, Login(req).getLogin()).then(_=>{
        res.send(Boolean(_));
    }).catch(err=>res.render("message", {message: err.message}));
});


module.exports = route;