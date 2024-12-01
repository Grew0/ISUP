const express = require('express');
const route = express.Router();
const Login = require('../../../model/login');
const ComSQL = require('../../../model/sql/comments');

route.use(express.json());
route.post("/write/:task", async (req, res)=>{
    console.log("req.body is")
    console.log(req.body);
    console.log("----")
    try{
        await ComSQL.write(req.body.content, Number(Login(req).getLogin()), Number(req.params.task));
    }catch(error){
        console.log("Error: " + error.message);
    }
    res.send("ok");
});

module.exports = route;