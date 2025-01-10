const express = require('express');

const route = express.Router();

const Login = require('../../../model/login');
const subs = require('../../../model/sql/subs');


route.get('/checkout', async (req, res) => {
    let chats = await subs.getSubs(Login(req).getLogin());
    res.render("chats", { chats: chats });
});


module.exports = route;