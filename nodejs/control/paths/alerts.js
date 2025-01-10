const express = require('express');
const Login = require('../../model/login');
const AlertsSQL = require('../../model/sql/alerts');

const route = express.Router();
const urlencodedParser = express.urlencoded({extended: false});


/// Read
route.get("/getByUser", (req, res) => {
    AlertsSQL.getByUser(Number(Login(req).getLogin()))
        .then((alerts) => {
            for (let i in alerts) {
                alerts[i].allow_to_change = true;
            }
            res.render("alerts", { alerts: alerts });
        }).catch(err => {
            res.render("message", { message: err.message })
        });

});

route.get("/getByTask/:task", (req, res) => {
    AlertsSQL.getByTask(Number(req.params.task))
        .then((alerts) => {
            for (let i in alerts) {
                alerts[i].allow_to_change = (Login(req).getLogin() == alerts[i].ownerid || Login(req).getLogin() == alerts[i].writer);
            }
            res.render("alerts", { alerts: alerts, task: true, task_id: req.params.task });
        }).catch(err => {
            res.render("message", { message: err.message })
        });

});


// Create
route.get("/append/:task", (req, res) => {
    res.render("alert_form", {create_type: true});
});

route.post("/append/:task", urlencodedParser, (req, res) => {
    let {desc} = req.body;

    AlertsSQL.write(Number(Login(req).getLogin()), Number(req.params.task), desc)
        .then(res.redirect(303, "/alerts/getByTask/" + req.params.task))
        .catch(err=>res.render("message", {"message": err.message}));
});

// Change

route.get("/change/:alert", (req, res) => {
    res.render("alert_form", {create_type: false});
});

route.post("/change/:alert", urlencodedParser, (req, res) => {
    let {desc} = req.body;

    AlertsSQL.change(Number(req.params.alert), desc)
        .then(task => res.redirect(303, "/alerts/getByTask/" + task))
        .catch(err=>res.render("message", {"message": err.message}));
});

// Close
route.post("/close/:id", (req, res) => {
    AlertsSQL.close(Number(req.params.id)).then(
        () => res.send("done"), (err) => res.send(err));
});

//Open
route.post("/open/:id", (req, res) => {
    AlertsSQL.open(Number(req.params.id)).then(
        () => res.send("done"), (err) => res.send(err));
});

//Delete
route.delete("/delete/:id", (req, res) => {
    AlertsSQL.delete(Number(req.params.id)).then(
        () => res.send("done"), (err) => res.send(err));
});

module.exports = route;
