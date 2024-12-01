const express = require('express');
const route = express.Router();

route.use("/", require("./tasks/create"));
route.use("/", require("./tasks/update"));
route.use("/", require("./tasks/delete"));
route.use("/", require("./tasks/read"));
route.use("/", require("./tasks/delegete"));

module.exports = route;
