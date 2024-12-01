
const express = require('express');
const route = express.Router();
const TaskSQL = require("../../../model/sql/task");
const Login = require("../../../model/login");
const urlencodedParser = express.urlencoded({ extended: false });


// To update tasks
route.get("/update/:id", (req, res) => {
    TaskSQL.read_where({ id: req.params.id }, async (result) => {
        if (!result || result.length != 1) {
            res.render('message', { message: 'Wrong task id' });
            return;
        }

        if (result.length != 1) {
            res.render('message', { message: 'No such task' });
            return;
        }

        result = result[0];

        if (Login(req).getLogin() != result.ownerid) {
            res.render('message', { message: 'Forbidden' });
            return;
        }

        res.render("update_task", {
            name: result.name,
            desc: result.descript,
            deadline: new Date(result.deadline),
            priority: result.priority
        });
    }, err => res.render("message", { message: err.message }));
});

route.post("/update/:id", urlencodedParser, (req, res) => {
    let id = req.params.id;
    let { name, desc, deadline, priority } = req.body;
    TaskSQL.checkOwner(Login(req).getLogin(), id)
        .then(_ => {
            if(_ == true){
                
            }
        })
        .catch(err => res.render("message", { message: err.message }));
    TaskSQL.update(id, {
        name: name,
        descript: desc,
        deadline: new Date(deadline),
        priority: priority
    }).then(_ => {
        let path = req.path.split("/");
        console.log(path);
        path.pop();
        res.redirect("../task/" + id);
    }, err => res.render("message", { message: err.message }));
});


route.get("/task/:id/close", (req, res) => {
    TaskSQL.close(Number(req.params.id))
        .then( _ => {
            if (_) res.redirect("../" + req.params.id);
            else res.render("message", { message: "Задачу нельзя закрыть - закройте все подзадачи", redirect: "../" + req.params.id });
        })
        .catch(err => res.render("message", { message: err.message, redirect: "../" + req.params.id}));
});

route.get("/task/:id/open", (req, res) => {
    TaskSQL.open(Number(req.params.id))
        .then(_ => {
            if(_)
                res.redirect("../" + req.params.id);
            else res.render("message", { message: "Задачу невозможно открыть - верхний уровень закрыт", redirect: "../" + req.params.id});
        })
        .catch(err => res.render("message", { message: err.message, redirect: "../" + req.params.id}));
});

module.exports = route;