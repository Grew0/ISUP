
const express = require('express');
const route = express.Router();
const TaskSQL = require("../../../model/sql/task");
const UserSQL = require("../../../model/sql/user");
const Login =   require("../../../model/login");

// To read certain task
route.get("/task/:id", (req, res)=>{
    Login(req).setLastURL(req.url);

    TaskSQL.read_where({id: Number(req.params.id)}, async (result)=>{
        if(!result || result.length != 1){
            res.send("Wrong id");
            return;
        }

        let {id, descript, ownerid, name, toplevelid, deadline, priority, isclosed} = result[0];
        const results = await Promise.all([UserSQL.getById(ownerid), TaskSQL.getChildren(id)]);        
        let allowed = await TaskSQL.checkOwner(Number(Login(req).getLogin()), id); 

        res.render("one_task", {
            desc: descript,
            name: name,
            underlevel: results[1].length? results[1]: false,
            priority: priority,
            deadline: deadline,
            owner: results[0].name,
            parent: id,
            toplevelid: toplevelid,
            allowed: allowed,
            allowed_directly: allowed == 1,
            isclosed: isclosed
        });    
    }, err=>res.send(err.message));
});


// To read my tasks
route.get("/my", (req, res)=>{
    console.log(Number(Login(req).getLogin()));
    TaskSQL.read_where({ownerid: Number(Login(req).getLogin())}, (data)=>{
        res.render("my_task", {vals: data});
    }, err=>res.send(err.message));
});

module.exports = route;