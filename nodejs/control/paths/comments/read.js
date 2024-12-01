const express = require('express');
const route = express.Router();
const ComSQL = require("../../../model/sql/comments");
const UserSQL = require("../../../model/sql/user");
const Login = require('../../../model/login');
const subs = require('../../../model/sql/subs');

// To read comments
route.get("/read/:task", async (req, res)=>{
    if(isNaN(Number(req.params.task))){
        res.send("Is it a number");
        return;
    }

    let renderData = {};
    try{
        renderData.isSub = await Login(req).isSubscribed(req.params.task);
    }catch(err){
        renderData.isSub = err.message;
    }

    res.render("comments", renderData);

});

route.get("/read/:task/getList", async(req, res)=>{
    if(isNaN(Number(req.params.task))){
        res.send("Is it a number");
        return;
    }

    let comments = await ComSQL.get(Number(req.params.task));
    let renderData = {};
    for(let i in comments){
        try{
            comments[i].writer = await UserSQL.getById(comments[i].writer);
        }catch(error){
            comments[i].writer = error.message;
        }
    }
    comments.reverse();

    renderData.comments = comments;
    res.render("commentsList", renderData);

    subs.watch(req.params.task, Login(req).getLogin());

});

route.get("/read/:task/back", async (req, res)=>{
    res.redirect("/tasks/task/" + req.params.task);
});
module.exports = route;